import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import { ArrowLeft, Camera, X, CheckCircle, RefreshCw, Send } from 'lucide-react';
import api from '../services/api';
import './MoodAssessment.css';

// Keys match the expression labels returned by face-api.js exactly
const EXPRESSION_MAP = {
  happy:     { label: 'Happy',      emoji: '😊', color: '#f9a825' },
  neutral:   { label: 'Neutral',    emoji: '😐', color: '#757575' },
  sad:       { label: 'Sad',        emoji: '😔', color: '#5c6bc0' },
  fearful:   { label: 'Anxious',    emoji: '😰', color: '#ef6c00' },
  surprised: { label: 'Surprised',  emoji: '😮', color: '#8e24aa' },
  angry:     { label: 'Frustrated', emoji: '😡', color: '#e53935' },
  disgusted: { label: 'Disgusted',  emoji: '🤢', color: '#558b2f' },
};

// Maps face-api expression labels → mood values accepted by the /moods backend
const API_MOOD_MAP = {
  happy:     'happy',
  neutral:   'calm',
  sad:       'sad',
  fearful:   'anxious',
  angry:     'frustrated',
  disgusted: 'frustrated',
  surprised: 'excited',
};

// Model weight files served from public/models (downloaded at install time)
const MODEL_URL = '/models';

const STORAGE_KEY = 'vamora_mood_assessments';

/**
 * Fast pixel-level pre-check — rejects all-black, overexposed, or
 * completely uniform frames before sending to face-api.js.
 */
function validateImage(canvas) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  if (!width || !height) return { valid: false, reason: 'No image data was captured.' };

  const data = ctx.getImageData(0, 0, width, height).data;
  const samples = [];

  for (let i = 0; i < data.length; i += 40) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    samples.push(0.299 * r + 0.587 * g + 0.114 * b); // perceptual luminance
  }

  const avg = samples.reduce((a, v) => a + v, 0) / samples.length;
  const variance = samples.reduce((a, v) => a + (v - avg) ** 2, 0) / samples.length;
  const stdDev = Math.sqrt(variance);

  if (avg < 15)    return { valid: false, reason: 'Image is too dark. Please try in better lighting.' };
  if (avg > 245)   return { valid: false, reason: 'Image is too bright. Please move away from direct light.' };
  if (stdDev < 12) return { valid: false, reason: 'No face detected. Please ensure your face fills the oval guide.' };

  return { valid: true };
}

/**
 * Real mood detection via face-api.js (TinyFaceDetector + FaceExpressionNet).
 * Runs entirely in the browser — no image data leaves the device.
 * Returns { label, emoji, color, confidence } on success or { error } on failure.
 */
async function detectMoodFromDataUrl(dataUrl) {
  const img = new Image();
  img.src = dataUrl;
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error('Image failed to load for analysis.'));
  });

  const detection = await faceapi
    .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
    .withFaceExpressions();

  if (!detection) {
    return { error: 'No face detected. Please ensure your face fills the oval guide and try again.' };
  }

  const [topExpression, topScore] = Object.entries(detection.expressions)
    .reduce((best, cur) => (cur[1] > best[1] ? cur : best));

  const mood = EXPRESSION_MAP[topExpression] ?? EXPRESSION_MAP.neutral;
  return { ...mood, expression: topExpression, confidence: Math.round(topScore * 100) };
}

// ─────────────────────────────────────────────────────────────────────────────

export default function MoodAssessment() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const toastTimerRef = useRef(null);

  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  });

  // idle | requesting | active | preview | analyzing | denied
  const [cameraState, setCameraState] = useState('idle');
  const [capturedDataUrl, setCapturedDataUrl] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [latestResult, setLatestResult] = useState(null);
  const [modelsReady, setModelsReady] = useState(false);
  const [modelError, setModelError] = useState(null);
  // null | 'db' | 'local'
  const [savedToast, setSavedToast] = useState(null);

  // Load TinyFaceDetector + FaceExpressionNet weights on mount
  useEffect(() => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ])
      .then(() => setModelsReady(true))
      .catch(err => {
        console.error('face-api model load failed:', err);
        setModelError('Failed to load face detection models. Please refresh the page.');
      });
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  // Wire live stream to <video> once the camera modal renders
  useEffect(() => {
    if (cameraState === 'active' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(console.error);
    }
  }, [cameraState]);

  // Stop camera tracks and clear toast timer on unmount
  useEffect(() => () => {
    stopStream();
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  // Shared camera-open logic used by "Scan My Mood" and "Retake"
  const openCamera = async () => {
    setCapturedDataUrl(null);
    setImageError(null);
    setCameraState('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      setCameraState('active');
    } catch (err) {
      setCameraState(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'denied'
          : 'idle'
      );
    }
  };

  const startScan = () => {
    setLatestResult(null);
    openCamera();
  };

  // Step 1: freeze frame → show preview for review
  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    canvas.width = w;
    canvas.height = h;

    // Mirror the canvas draw to match the mirrored video viewfinder
    const ctx = canvas.getContext('2d');
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    stopStream();

    const validation = validateImage(canvas);
    setCapturedDataUrl(canvas.toDataURL('image/jpeg', 0.92));
    setImageError(validation.valid ? null : validation.reason);
    setCameraState('preview');
  };

  // Step 2: user confirms the preview → run face-api.js detection
  const submitCapture = async () => {
    if (imageError) return;
    setCameraState('analyzing');

    let result;
    try {
      result = await detectMoodFromDataUrl(capturedDataUrl);
    } catch (err) {
      console.error('Detection error:', err);
      setImageError('Analysis failed unexpectedly. Please try again.');
      setCameraState('preview');
      return;
    }

    if (result.error) {
      // face-api.js found no face — show error back in preview so the user can retake
      setImageError(result.error);
      setCameraState('preview');
      return;
    }

    const entry = { id: Date.now(), ...result, timestamp: new Date().toISOString() };
    setHistory(prev => [entry, ...prev]);
    setLatestResult(entry);
    setCameraState('idle');

    // Persist to backend; localStorage is already saved via the history useEffect
    const apiMood = API_MOOD_MAP[result.expression] || 'calm';
    let toastType = 'local';
    try {
      await api.post('/moods', { mood: apiMood, note: 'Detected via camera', source: 'camera' });
      toastType = 'db';
    } catch (err) {
      console.error('Backend mood save failed, kept in localStorage:', err);
    }
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setSavedToast(toastType);
    toastTimerRef.current = setTimeout(() => setSavedToast(null), 3000);
  };

  const closeCamera = () => {
    stopStream();
    setCameraState('idle');
  };

  const formatTimestamp = iso =>
    new Date(iso).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const modalOpen = cameraState === 'active' || cameraState === 'preview';

  return (
    <div className="ma-container">

      {/* ── Header ── */}
      <header className="ma-header">
        <button className="ma-back-btn" onClick={() => navigate('/patient-dashboard')}>
          <ArrowLeft size={20} /> Back
        </button>
        <div className="ma-header-body">
          <span className="ma-header-icon">🧠</span>
          <div>
            <h1 className="ma-title">Mood Assessment</h1>
            <p className="ma-subtitle">Real-time facial expression analysis</p>
          </div>
        </div>
        <div className="ma-model-badge">
          <span className="ma-model-badge-dot" />
          Powered by <strong>face-api.js</strong> + TensorFlow.js &mdash; runs entirely
          in your browser. No images are sent to any server.
        </div>
      </header>

      {/* ── Scan Controls ── */}
      <div className="ma-scan-area">
        {cameraState === 'idle' && !modelsReady && !modelError && (
          <div className="ma-status">
            <div className="ma-spinner" />
            <p>Loading face detection models…</p>
          </div>
        )}

        {cameraState === 'idle' && modelError && (
          <div className="ma-denied">
            <p className="ma-denied-icon">⚠️</p>
            <p className="ma-denied-msg">Models failed to load</p>
            <p className="ma-denied-sub">{modelError}</p>
          </div>
        )}

        {cameraState === 'idle' && modelsReady && (
          <button className="ma-scan-btn" onClick={startScan}>
            <Camera size={30} />
            <span>Scan My Mood</span>
          </button>
        )}

        {cameraState === 'requesting' && (
          <div className="ma-status">
            <div className="ma-spinner" />
            <p>Requesting camera access…</p>
          </div>
        )}

        {cameraState === 'analyzing' && (
          <div className="ma-status analyzing">
            <div className="ma-spinner pulse" />
            <p>Analysing your expression…</p>
          </div>
        )}

        {cameraState === 'denied' && (
          <div className="ma-denied">
            <p className="ma-denied-icon">📷</p>
            <p className="ma-denied-msg">Camera access was denied.</p>
            <p className="ma-denied-sub">
              Please allow camera access in your browser settings, then try again.
            </p>
            <button className="ma-retry-btn" onClick={() => setCameraState('idle')}>
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* ── Camera / Preview Modal ── */}
      {modalOpen && (
        <div className="ma-overlay">
          <div className="ma-modal">
            <button className="ma-modal-close" onClick={closeCamera} aria-label="Close">
              <X size={22} />
            </button>

            {/* Live camera phase */}
            {cameraState === 'active' && (
              <>
                <h2 className="ma-modal-title">Centre your face in the frame</h2>
                <div className="ma-video-wrapper">
                  <video ref={videoRef} autoPlay playsInline muted className="ma-video" />
                  <div className="ma-face-guide" />
                </div>
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <button className="ma-capture-btn" onClick={takePhoto}>
                  <Camera size={22} />
                  Take Photo
                </button>
              </>
            )}

            {/* Preview / review phase */}
            {cameraState === 'preview' && (
              <>
                <h2 className="ma-modal-title">Review your photo</h2>
                <div className="ma-preview-wrapper">
                  <img
                    src={capturedDataUrl}
                    alt="Captured frame for mood assessment"
                    className="ma-preview-img"
                  />
                </div>

                {imageError && (
                  <div className="ma-image-error">
                    <span className="ma-image-error-icon">⚠️</span>
                    <span>{imageError}</span>
                  </div>
                )}

                <div className="ma-modal-actions">
                  <button className="ma-retake-btn" onClick={openCamera}>
                    <RefreshCw size={18} />
                    Retake
                  </button>
                  <button
                    className="ma-submit-btn"
                    onClick={submitCapture}
                    disabled={!!imageError}
                    title={imageError ? 'Fix the image issue before submitting' : undefined}
                  >
                    <Send size={18} />
                    Submit
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Latest Result Banner ── */}
      {latestResult && cameraState === 'idle' && (
        <div className="ma-result-banner" style={{ borderColor: latestResult.color }}>
          <CheckCircle size={26} color={latestResult.color} />
          <span className="ma-result-emoji">{latestResult.emoji}</span>
          <div className="ma-result-text">
            <p className="ma-result-mood" style={{ color: latestResult.color }}>
              {latestResult.label} detected!
            </p>
            <p className="ma-result-conf">Confidence: {latestResult.confidence}%</p>
          </div>
          <button className="ma-scan-again-btn" onClick={startScan}>
            Scan Again
          </button>
        </div>
      )}

      {/* ── Save Toast ── */}
      {savedToast && (
        <div style={{
          position: 'fixed', bottom: '2rem', left: '50%',
          transform: 'translateX(-50%)',
          background: savedToast === 'db' ? '#2e7d32' : '#f57c00',
          color: 'white', borderRadius: '12px',
          padding: '0.7rem 1.4rem', fontWeight: 600, fontSize: '0.95rem',
          boxShadow: '0 4px 18px rgba(0,0,0,0.22)',
          zIndex: 9999, display: 'flex', alignItems: 'center', gap: '0.5rem',
          whiteSpace: 'nowrap',
        }}>
          <CheckCircle size={18} />
          {savedToast === 'db' ? 'Mood saved to your record' : 'Saved locally'}
        </div>
      )}

      {/* ── History Table ── */}
      <section className="ma-history">
        <h2 className="ma-history-title">Assessment History</h2>

        {history.length === 0 ? (
          <div className="ma-history-empty">
            <p>No assessments yet — tap <strong>Scan My Mood</strong> to get started!</p>
          </div>
        ) : (
          <div className="ma-table-wrapper">
            <table className="ma-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Mood</th>
                  <th>Confidence</th>
                  <th>Date &amp; Time</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, i) => (
                  <tr key={entry.id}>
                    <td className="ma-td-num">{history.length - i}</td>
                    <td className="ma-td-mood">
                      <span className="ma-tbl-emoji">{entry.emoji}</span>
                      <span style={{ color: entry.color, fontWeight: 600 }}>
                        {entry.label}
                      </span>
                    </td>
                    <td className="ma-td-conf">
                      <div className="ma-bar-track">
                        <div
                          className="ma-bar-fill"
                          style={{ width: `${entry.confidence}%`, background: entry.color }}
                        />
                      </div>
                      <span className="ma-bar-label">{entry.confidence}%</span>
                    </td>
                    <td className="ma-td-date">{formatTimestamp(entry.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
