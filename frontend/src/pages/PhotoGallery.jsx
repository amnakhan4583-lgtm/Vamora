import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import './PhotoGallery.css';

export default function PhotoGallery() {
  const [photos, setPhotos] = useState([]);
  const [caption, setCaption] = useState('');
  const [captionError, setCaptionError] = useState('');
  const [recording, setRecording] = useState(null);
  const [mediaRec, setMediaRec] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const fileInput = useRef();

  useEffect(() => { fetchPhotos(); }, []);

  const fetchPhotos = async () => {
    try {
      const { data } = await api.get('/photos');
      setPhotos(data);
    } catch (err) {
      console.error('Error fetching photos:', err);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!caption.trim()) {
      setCaptionError('Please write a caption before uploading.');
      fileInput.current.value = '';
      return;
    }
    try {
      setCaptionError('');
      const fd = new FormData();
      fd.append('photo', file);
      fd.append('caption', caption.trim());
      await api.post('/photos', fd);
      setCaption('');
      fetchPhotos();
    } catch (err) {
      console.error('Error uploading photo:', err);
    }
  };

  const startRecording = async (photoId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks = [];
      rec.ondataavailable = e => chunks.push(e.data);
      rec.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const fd = new FormData();
        fd.append('voice', blob, 'voice.webm');
        await api.post('/photos/' + photoId + '/voice', fd);
        fetchPhotos();
        stream.getTracks().forEach(t => t.stop());
      };
      rec.start();
      setMediaRec(rec);
      setRecording(photoId);
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    mediaRec?.stop();
    setRecording(null);
    setMediaRec(null);
  };

  const handleDelete = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;
    try {
      await api.delete('/photos/' + photoId);
      fetchPhotos();
    } catch (err) {
      console.error('Error deleting photo:', err);
    }
  };

  const getImageUrl = (filename) => {
    const clean = filename.replace(/\\/g, '/');
    if (clean.startsWith('/')) return clean;
    return '/' + clean;
  };

  return (
    <div className="gallery-container">

      <div className="gallery-header">
        <h1 className="gallery-title">📸 My Memories</h1>
        <p className="gallery-subtitle">Your cherished moments, always with you</p>
      </div>

      <div className="upload-section">
        <div className="upload-row">
          <input
            type="text"
            className="caption-input-field"
            placeholder="Write a caption for this photo *"
            value={caption}
            onChange={e => {
              setCaption(e.target.value);
              setCaptionError('');
            }}
          />
          <button className="upload-btn" onClick={() => fileInput.current.click()}>
            📷 Add Photo
          </button>
          <input ref={fileInput} type="file" accept="image/*" hidden onChange={handleUpload} />
        </div>
        {captionError && <p className="caption-error">⚠️ {captionError}</p>}
      </div>

      {photos.length > 0 && (
        <p className="photo-count">🖼 {photos.length} {photos.length === 1 ? 'Memory' : 'Memories'}</p>
      )}

      {photos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌟</div>
          <p className="empty-text">No memories yet</p>
          <p className="empty-subtext">Upload your first photo to get started!</p>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map(photo => (
            <div key={photo.id} className="photo-card">
              <img
                src={getImageUrl(photo.filename)}
                alt={photo.caption}
                className="photo-image"
                style={{ cursor: 'pointer' }}
                onClick={() => setPreviewPhoto(photo)}
                onError={e => { e.target.src = 'https://via.placeholder.com/280x220?text=Photo'; }}
              />
              <div className="photo-details">
                <p className="photo-caption">{photo.caption}</p>
                <p className="photo-date">
                  {new Date(photo.takenAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </p>

                {photo.voiceNoteUrl && (
                  <audio controls src={getImageUrl(photo.voiceNoteUrl)} className="voice-player" />
                )}

                <div className="card-actions">
                  {recording === photo.id ? (
                    <button className="voice-btn recording" onClick={stopRecording}>
                      ⏹ Stop Recording
                    </button>
                  ) : (
                    <button className="voice-btn" onClick={() => startRecording(photo.id)}>
                      {photo.voiceNoteUrl ? '🎙 Replace Memory Note' : '🎙 Add a Memory Note'}
                    </button>
                  )}
                  <button className="delete-btn" onClick={() => handleDelete(photo.id)}>
                    🗑 Delete Photo
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Preview Modal */}
      {previewPhoto && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem'
          }}
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            style={{
              background: 'white', borderRadius: '20px', overflow: 'hidden',
              maxWidth: '90vw', maxHeight: '90vh', position: 'relative',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)', display: 'flex',
              flexDirection: 'column'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewPhoto(null)}
              style={{
                position: 'absolute', top: '0.75rem', right: '0.75rem',
                background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none',
                width: '36px', height: '36px', borderRadius: '50%',
                fontSize: '1rem', cursor: 'pointer', zIndex: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >✕</button>
            <img
              src={getImageUrl(previewPhoto.filename)}
              alt={previewPhoto.caption}
              style={{
                width: '100%', maxHeight: '70vh',
                objectFit: 'contain', background: '#1a1a2e', display: 'block'
              }}
            />
            <div style={{ padding: '1.2rem 1.5rem', background: 'white' }}>
              <p style={{ fontSize: '1.2rem', fontWeight: '700', color: '#2d1f3d', margin: '0 0 0.4rem 0' }}>
                {previewPhoto.caption}
              </p>
              <p style={{ fontSize: '0.85rem', color: '#7b5ea7', margin: 0, fontStyle: 'italic' }}>
                {new Date(previewPhoto.takenAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}