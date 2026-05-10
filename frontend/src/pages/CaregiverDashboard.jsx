 import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './CaregiverDashboard.css';

export default function CaregiverDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [memories, setMemories] = useState([]);
  const [memoriesLoading, setMemoriesLoading] = useState(false);
  const [memFile, setMemFile] = useState(null);
  const [memCaption, setMemCaption] = useState('');
  const [memCategory, setMemCategory] = useState('memory');
  const [memError, setMemError] = useState('');
  const [memSuccess, setMemSuccess] = useState('');
  const [memUploading, setMemUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadCategory, setUploadCategory] = useState('family');
  const [uploadMsg, setUploadMsg] = useState('');

  const caregiverName = user?.email?.split('@')[0] || 'Caregiver';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { fetchPatients(); }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/caregiver/patients');
      setPatients(data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientDetails = async (patientId) => {
    try {
      setDetailsLoading(true);
      const { data } = await api.get(`/caregiver/patients/${patientId}`);
      setPatientDetails(data);
    } catch (err) {
      console.error('Error fetching patient details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchMemories = async (patientId) => {
    try {
      setMemoriesLoading(true);
      const { data } = await api.get(`/caregiver/patients/${patientId}/photos`);
      setMemories(data);
    } catch (err) {
      console.error('Error fetching memories:', err);
    } finally {
      setMemoriesLoading(false);
    }
  };

  const handleUploadMemory = async () => {
    if (!memFile) { setMemError('Please select a photo.'); return; }
    if (!memCaption.trim()) { setMemError('Caption is required.'); return; }
    setMemUploading(true);
    setMemError('');
    try {
      const formData = new FormData();
      formData.append('photo', memFile);
      formData.append('caption', memCaption.trim());
      formData.append('category', memCategory);
      await api.post(`/caregiver/patients/${selectedPatient.id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMemFile(null);
      setMemCaption('');
      setMemCategory('memory');
      setMemSuccess('Memory added!');
      await fetchMemories(selectedPatient.id);
      setTimeout(() => setMemSuccess(''), 3000);
    } catch (err) {
      setMemError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setMemUploading(false);
    }
  };

  const handleUploadPhoto = async () => {
    if (!uploadFile) { setUploadMsg('Please select a photo.'); return; }
    if (!uploadCaption.trim()) { setUploadMsg('Caption is required.'); return; }
    const pid = selectedPatient.patientId || selectedPatient.id;
    try {
      setUploadMsg('');
      const formData = new FormData();
      formData.append('photo', uploadFile);
      formData.append('caption', uploadCaption.trim());
      formData.append('category', uploadCategory);
      await api.post(`/caregiver/patients/${pid}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadFile(null);
      setUploadCaption('');
      setUploadCategory('family');
      setUploadMsg('Memory added!');
      fetchPatientDetails(pid);
      setTimeout(() => setUploadMsg(''), 3000);
    } catch (err) {
      setUploadMsg(err.response?.data?.message || 'Upload failed.');
    }
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    const pid = patient.patientId || patient.id;
    fetchPatientDetails(pid);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const pid = selectedPatient.patientId || selectedPatient.id;
    try {
      await api.post(`/caregiver/patients/${pid}/notes`, { note: newNote });
      setNewNote('');
      fetchPatientDetails(pid);
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    const pid = selectedPatient.patientId || selectedPatient.id;
    try {
      await api.delete(`/caregiver/notes/${noteId}`);
      fetchPatientDetails(pid);
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };


  const getMoodEmoji = (mood) => {
    const emojis = { happy: '😊', calm: '😌', sad: '😔', anxious: '😰', frustrated: '😡', tired: '😴', excited: '🤩', confused: '😕' };
    return emojis[mood] || '😐';
  };

  const getWellnessColor = (score) => {
    if (!score) return '#94a3b8';
    if (score >= 7) return '#43a047';
    if (score >= 4) return '#fb8c00';
    return '#e53935';
  };

  const getMoodScore = (mood) => {
    const scores = { happy: 10, excited: 10, calm: 8, tired: 5, confused: 4, anxious: 3, frustrated: 3, sad: 2 };
    return scores[mood] || 5;
  };

  const getMoodBarColor = (mood) => {
    if (['happy', 'excited', 'calm'].includes(mood)) return '#43a047';
    if (['tired', 'confused'].includes(mood)) return '#fb8c00';
    return '#e53935';
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });

  const formatDateTime = (date) => new Date(date).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const formatCurrentDate = () => currentTime.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const formatCurrentTime = () => currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const alertPatients = patients.filter(p => p.hasAlert);

  const moodGraphData = patientDetails?.moods
    ? [...patientDetails.moods].reverse().map(m => ({
        date: new Date(m.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: getMoodScore(m.mood),
        mood: m.mood
      }))
    : [];

  if (loading) return (
    <div className="cg-loading">
      <div className="cg-spinner"></div>
      <p>Loading dashboard...</p>
    </div>
  );

  // ── Patient Detail View ──
  if (selectedPatient && patientDetails) {
    return (
      <div className="cg-container">
        <div className="cg-detail-header">
          <button className="cg-back-btn" onClick={() => { setSelectedPatient(null); setPatientDetails(null); setMemories([]); setMemError(''); setMemSuccess(''); setUploadFile(null); setUploadCaption(''); setUploadCategory('family'); setUploadMsg(''); }}>
            ← Back to Dashboard
          </button>
          <h1 className="cg-detail-title">{patientDetails.patient.name}</h1>
        </div>

        {/* Summary Card */}
        <div className="cg-summary-card">
          <div className="cg-summary-item">
            <span className="cg-summary-label">Wellness Score</span>
            <span className="cg-summary-value" style={{ color: getWellnessColor(patientDetails.wellnessScore) }}>
              {patientDetails.wellnessScore ? `${patientDetails.wellnessScore}/10` : 'N/A'}
            </span>
          </div>
          <div className="cg-summary-item">
            <span className="cg-summary-label">Latest Mood</span>
            <span className="cg-summary-value">
              {patientDetails.latestMood
                ? `${getMoodEmoji(patientDetails.latestMood.mood)} ${patientDetails.latestMood.mood}`
                : 'No check-in'}
            </span>
          </div>
          <div className="cg-summary-item">
            <span className="cg-summary-label">Total Memories</span>
            <span className="cg-summary-value">{patientDetails.photos.length} photos</span>
          </div>
          <div className="cg-summary-item">
            <span className="cg-summary-label">Appointments</span>
            <span className="cg-summary-value">{patientDetails.appointments.length} scheduled</span>
          </div>
          {patientDetails.hasAlert && (
            <div className="cg-alert-badge">Needs Attention Today</div>
          )}
        </div>

        {/* Mood History + Graph */}
        <div className="cg-section">
          <h2 className="cg-section-title">Mood History</h2>
          {patientDetails.moods.length === 0 ? (
            <p className="cg-empty">No mood check-ins yet.</p>
          ) : (
            <>
              <div className="cg-graph-container">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={moodGraphData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#90a4ae' }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#90a4ae' }} />
                    <Tooltip
                      formatter={(value, name, props) => [props.payload.mood, 'Mood']}
                      contentStyle={{ borderRadius: '10px', border: '1px solid #e3f2fd' }}
                    />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                      {moodGraphData.map((entry, i) => (
                        <Cell key={i} fill={getMoodBarColor(entry.mood)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="cg-graph-legend">
                  <span className="cg-legend-item cg-legend-green">Good</span>
                  <span className="cg-legend-item cg-legend-orange">Neutral</span>
                  <span className="cg-legend-item cg-legend-red">Needs Attention</span>
                </div>
              </div>

              <div className="cg-mood-list">
                {patientDetails.moods.map((m, i) => (
                  <div key={i} className={`cg-mood-item ${['sad', 'anxious', 'frustrated'].includes(m.mood) ? 'cg-mood-alert' : ''}`}>
                    <span className="cg-mood-emoji">{getMoodEmoji(m.mood)}</span>
                    <div>
                      <p className="cg-mood-name">{m.mood}</p>
                      <p className="cg-mood-date">{formatDate(m.recordedAt)}</p>
                      {m.note && <p className="cg-mood-note">"{m.note}"</p>}
                    </div>
                    {['sad', 'anxious', 'frustrated'].includes(m.mood) && (
                      <span className="cg-alert-dot">!</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Appointments — read-only, managed by doctor */}
        <div className="cg-section">
          <div className="cg-section-header">
            <h2 className="cg-section-title">Appointments</h2>
            <span className="cg-readonly-badge">Set by Doctor</span>
          </div>
          {patientDetails.appointments.length === 0 ? (
            <p className="cg-empty">No appointments scheduled.</p>
          ) : (
            <div className="cg-appointment-list">
              {patientDetails.appointments.map(a => (
                <div key={a.id} className="cg-appointment-item">
                  <div>
                    <p className="cg-appointment-title">{a.title}</p>
                    {a.doctorName && <p className="cg-appointment-sub">{a.doctorName}</p>}
                    {a.appointmentType && <p className="cg-appointment-sub">{a.appointmentType}</p>}
                    <p className="cg-appointment-date">{formatDateTime(a.appointmentDate)}</p>
                    {a.notes && <p className="cg-appointment-sub">{a.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Medications — read-only, managed by doctor */}
        <div className="cg-section">
          <div className="cg-section-header">
            <h2 className="cg-section-title">💊 Medication Schedule</h2>
            <span className="cg-readonly-badge">Set by Doctor</span>
          </div>
          {!patientDetails.medications || patientDetails.medications.length === 0 ? (
            <p className="cg-empty">No medications prescribed yet.</p>
          ) : (
            <div className="cg-appointment-list">
              {patientDetails.medications.map(m => (
                <div key={m.id} className="cg-appointment-item">
                  <div>
                    <p className="cg-appointment-title">💊 {m.medicationName}</p>
                    {m.dosage && <p className="cg-appointment-sub">Dose: {m.dosage}</p>}
                    {m.frequency && <p className="cg-appointment-sub">Frequency: {m.frequency}</p>}
                    {m.timing && <p className="cg-appointment-sub">Timing: {m.timing}</p>}
                    {m.startDate && <p className="cg-appointment-sub">Started: {formatDate(m.startDate)}</p>}
                    {m.notes && <p className="cg-appointment-sub">{m.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Care Notes */}
        <div className="cg-section">
          <h2 className="cg-section-title">Care Diary</h2>
          <div className="cg-note-form">
            <textarea className="cg-input" placeholder="Write a care note..." value={newNote}
              onChange={e => setNewNote(e.target.value)} rows={3} />
            <button className="cg-submit-btn" onClick={handleAddNote}>Add Note</button>
          </div>
          {patientDetails.careNotes.length === 0 ? (
            <p className="cg-empty">No care notes yet.</p>
          ) : (
            <div className="cg-notes-list">
              {patientDetails.careNotes.map(n => (
                <div key={n.id} className="cg-note-item">
                  <div>
                    <p className="cg-note-text">{n.note}</p>
                    <p className="cg-note-date">{formatDate(n.createdAt)}</p>
                  </div>
                  <button className="cg-delete-btn" onClick={() => handleDeleteNote(n.id)}>X</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Memories */}
        <div className="cg-section">
          <h2 className="cg-section-title">📸 Memories</h2>

          {/* Existing photos grid */}
          {!patientDetails.photos || patientDetails.photos.length === 0 ? (
            <p className="cg-empty">No memories added yet. Upload the first one below 💙</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {patientDetails.photos.map(photo => {
                const src = `http://localhost:5000/uploads/photos/${photo.filename}`;
                return (
                  <div key={photo.id} style={{ borderRadius: '12px', overflow: 'hidden', background: '#f8f5ff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <img
                      src={src}
                      alt={photo.caption}
                      style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    <div style={{ padding: '0.5rem 0.6rem' }}>
                      <p style={{ fontSize: '0.82rem', color: '#2d1f3d', fontWeight: 600, margin: '0 0 0.25rem 0', lineHeight: 1.3 }}>{photo.caption}</p>
                      {photo.category && (
                        <span style={{
                          display: 'inline-block', background: '#7b5ea7', color: 'white',
                          borderRadius: '999px', padding: '0.15rem 0.55rem',
                          fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize',
                        }}>{photo.category}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Upload form */}
          <div className="cg-note-form" style={{ flexDirection: 'column', gap: '0.6rem' }}>
            <input
              type="file"
              accept="image/*"
              className="cg-input"
              onChange={e => { setUploadFile(e.target.files[0] || null); setUploadMsg(''); }}
            />
            <input
              type="text"
              className="cg-input"
              placeholder="Caption *"
              value={uploadCaption}
              onChange={e => { setUploadCaption(e.target.value); setUploadMsg(''); }}
            />
            <select
              className="cg-input"
              value={uploadCategory}
              onChange={e => setUploadCategory(e.target.value)}
            >
              <option value="family">Family</option>
              <option value="pet">Pet</option>
              <option value="home">Home</option>
              <option value="memory">Memory</option>
            </select>
            {uploadMsg && (
              <p style={{
                color: uploadMsg === 'Memory added!' ? '#43a047' : '#e53935',
                fontWeight: 600, fontSize: '0.9rem', margin: 0
              }}>{uploadMsg}</p>
            )}
            <button className="cg-submit-btn" onClick={handleUploadPhoto}>
              Add Memory
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Dashboard View ──
  return (
    <div className="cg-container">

      {/* Header */}
      <div className="cg-header">
        <div>
          <h1 className="cg-title">Welcome back, {caregiverName}!</h1>
          <p className="cg-subtitle">{formatCurrentDate()} &nbsp;|&nbsp; {formatCurrentTime()}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="cg-stats-row">
        <div className="cg-stat-card">
          <div className="cg-stat-value">{patients.length}</div>
          <div className="cg-stat-label">Total Patients</div>
        </div>
        <div className="cg-stat-card">
          <div className="cg-stat-value" style={{ color: alertPatients.length > 0 ? '#e53935' : '#43a047' }}>
            {alertPatients.length}
          </div>
          <div className="cg-stat-label">Alerts</div>
        </div>
        <div className="cg-stat-card">
          <div className="cg-stat-value">
            {patients.filter(p => ['happy', 'calm', 'excited'].includes(p.latestMood)).length}
          </div>
          <div className="cg-stat-label">Feeling Good</div>
        </div>
        <div className="cg-stat-card">
          <div className="cg-stat-value">
            {patients.length > 0
              ? Math.round(patients.reduce((sum, p) => sum + (p.wellnessScore || 0), 0) / patients.length)
              : 0}/10
          </div>
          <div className="cg-stat-label">Avg Wellness</div>
        </div>
      </div>

      {/* Alerts Section */}
      {alertPatients.length > 0 && (
        <div className="cg-alerts-section">
          <h2 className="cg-alerts-title">Needs Attention Today</h2>
          <div className="cg-alerts-list">
            {alertPatients.map(p => (
              <div key={p.id} className="cg-alert-item">
                <span className="cg-alert-name">{p.name}</span>
                <span className="cg-alert-mood">
                  {getMoodEmoji(p.latestMood)} Feeling {p.latestMood} today
                </span>
                <button className="cg-view-btn-sm" onClick={() => handleViewPatient(p)}>
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patients Grid */}
      <div className="cg-patients-header">
        <h2 className="cg-patients-title">My Patients</h2>
      </div>

      {patients.length === 0 ? (
        <div className="cg-empty-state">
          <div className="cg-empty-icon">👥</div>
          <p className="cg-empty-text">No patients assigned yet</p>
          <p className="cg-empty-sub">Your doctor will assign patients to you.</p>
        </div>
      ) : (
        <div className="cg-patients-grid">
          {patients.map(patient => (
            <div key={patient.id} className={`cg-patient-card ${patient.hasAlert ? 'cg-card-alert' : ''}`}>
              {patient.hasAlert && <div className="cg-card-alert-badge">Needs Attention</div>}
              <div className="cg-card-avatar">👤</div>
              <h3 className="cg-card-name">{patient.name}</h3>
              <div className="cg-card-mood">
                {patient.latestMood ? (
                  <span>{getMoodEmoji(patient.latestMood)} {patient.latestMood}</span>
                ) : (
                  <span>No mood check-in</span>
                )}
              </div>
              <div className="cg-card-stats">
                <span>{patient.photoCount} memories</span>
                <span style={{ color: getWellnessColor(patient.wellnessScore) }}>
                  Wellness: {patient.wellnessScore ? `${patient.wellnessScore}/10` : 'N/A'}
                </span>
              </div>
              <button className="cg-view-btn" onClick={() => handleViewPatient(patient)}>
                View Patient
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}