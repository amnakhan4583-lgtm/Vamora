 import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './CaregiverDashboard.css';

export default function CaregiverDashboard() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [patientEmail, setPatientEmail] = useState('');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [appointment, setAppointment] = useState({
    title: '', doctorName: '', appointmentType: '', appointmentDate: '', notes: ''
  });
  const [currentTime, setCurrentTime] = useState(new Date());

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

  const handleAddPatient = async () => {
    try {
      setAddError('');
      setAddSuccess('');
      await api.post('/caregiver/patients/add', { email: patientEmail });
      setAddSuccess('Patient added successfully!');
      setPatientEmail('');
      fetchPatients();
      setTimeout(() => { setShowAddPatient(false); setAddSuccess(''); }, 2000);
    } catch (err) {
      setAddError(err.response?.data?.error || 'Failed to add patient.');
    }
  };

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    fetchPatientDetails(patient.id);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await api.post(`/caregiver/patients/${selectedPatient.id}/notes`, { note: newNote });
      setNewNote('');
      fetchPatientDetails(selectedPatient.id);
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await api.delete(`/caregiver/notes/${noteId}`);
      fetchPatientDetails(selectedPatient.id);
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const handleAddAppointment = async () => {
    if (!appointment.title || !appointment.appointmentDate) return;
    try {
      await api.post(`/caregiver/patients/${selectedPatient.id}/appointments`, appointment);
      setAppointment({ title: '', doctorName: '', appointmentType: '', appointmentDate: '', notes: '' });
      setShowAddAppointment(false);
      fetchPatientDetails(selectedPatient.id);
    } catch (err) {
      console.error('Error adding appointment:', err);
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Delete this appointment?')) return;
    try {
      await api.delete(`/caregiver/appointments/${appointmentId}`);
      fetchPatientDetails(selectedPatient.id);
    } catch (err) {
      console.error('Error deleting appointment:', err);
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
          <button className="cg-back-btn" onClick={() => { setSelectedPatient(null); setPatientDetails(null); }}>
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

        {/* Appointments */}
        <div className="cg-section">
          <div className="cg-section-header">
            <h2 className="cg-section-title">Appointments</h2>
            <button className="cg-add-btn" onClick={() => setShowAddAppointment(!showAddAppointment)}>
              + Add
            </button>
          </div>

          {showAddAppointment && (
            <div className="cg-form">
              <input className="cg-input" placeholder="Title *" value={appointment.title}
                onChange={e => setAppointment({ ...appointment, title: e.target.value })} />
              <input className="cg-input" placeholder="Doctor Name" value={appointment.doctorName}
                onChange={e => setAppointment({ ...appointment, doctorName: e.target.value })} />
              <input className="cg-input" placeholder="Type (checkup, therapy...)" value={appointment.appointmentType}
                onChange={e => setAppointment({ ...appointment, appointmentType: e.target.value })} />
              <input className="cg-input" type="datetime-local" value={appointment.appointmentDate}
                onChange={e => setAppointment({ ...appointment, appointmentDate: e.target.value })} />
              <textarea className="cg-input" placeholder="Notes (optional)" value={appointment.notes}
                onChange={e => setAppointment({ ...appointment, notes: e.target.value })} />
              <button className="cg-submit-btn" onClick={handleAddAppointment}>Save Appointment</button>
            </div>
          )}

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
                  <button className="cg-delete-btn" onClick={() => handleDeleteAppointment(a.id)}>X</button>
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
        <button className="cg-add-patient-btn" onClick={() => setShowAddPatient(!showAddPatient)}>
          + Add Patient
        </button>
      </div>

      {/* Add Patient Form */}
      {showAddPatient && (
        <div className="cg-add-patient-form">
          <h3 className="cg-form-title">Add Patient by Email</h3>
          <div className="cg-form-row">
            <input
              className="cg-input"
              placeholder="Enter patient's registered email"
              value={patientEmail}
              onChange={e => { setPatientEmail(e.target.value); setAddError(''); }}
            />
            <button className="cg-submit-btn" onClick={handleAddPatient}>Add</button>
          </div>
          {addError && <p className="cg-error">{addError}</p>}
          {addSuccess && <p className="cg-success">{addSuccess}</p>}
        </div>
      )}

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
          <p className="cg-empty-sub">Click "Add Patient" to get started!</p>
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