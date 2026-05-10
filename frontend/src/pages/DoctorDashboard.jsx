import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine,
  BarChart, Bar, Cell
} from 'recharts';
import './DoctorDashboard.css';

const MOOD_EMOJI = { happy: '😊', calm: '😌', sad: '😔', anxious: '😰', frustrated: '😡', tired: '😴', excited: '🤩', confused: '😕' };
const MOOD_SCORES = { happy: 10, excited: 10, calm: 8, tired: 5, confused: 4, anxious: 3, frustrated: 3, sad: 2 };

function getMoodBarColor(mood) {
  if (['happy', 'excited', 'calm'].includes(mood)) return '#43a047';
  if (['tired', 'confused'].includes(mood)) return '#fb8c00';
  return '#e53935';
}

function getCognitiveStyle(status) {
  if (status === 'Stable') return { background: '#43a047', color: '#fff' };
  if (status === 'Needs Monitoring') return { background: '#fb8c00', color: '#fff' };
  if (status === 'Declining') return { background: '#e53935', color: '#fff' };
  return { background: '#e0e0e0', color: '#757575' };
}

function getWellnessColor(score) {
  if (!score) return '#94a3b8';
  if (score >= 7) return '#43a047';
  if (score >= 4) return '#fb8c00';
  return '#e53935';
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatDateTime(iso) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function DoctorDashboard() {
  const { user } = useAuth();
  const doctorName = user?.profile?.name?.split(' ')[0]
    || user?.email?.split('@')[0]?.split('.')?.[0] || 'Doctor';
  const displayName = doctorName.charAt(0).toUpperCase() + doctorName.slice(1);

  const [view, setView] = useState('overview');
  const [activeDetailTab, setActiveDetailTab] = useState('appointments');

  const [patients, setPatients] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [deletingPatient, setDeletingPatient] = useState(null);
  const [loadError, setLoadError] = useState('');

  const [showApptForm, setShowApptForm] = useState(false);
  const [appt, setAppt] = useState({ title: '', doctorName: '', appointmentType: '', appointmentDate: '', notes: '' });
  const [apptError, setApptError] = useState('');

  const [showMedForm, setShowMedForm] = useState(false);
  const [med, setMed] = useState({ medicationName: '', dosage: '', frequency: '', timing: '', startDate: '', notes: '' });
  const [medError, setMedError] = useState('');

  const [showMmseForm, setShowMmseForm] = useState(false);
  const [mmseEntry, setMmseEntry] = useState({ score: '', assessmentDate: '', notes: '' });
  const [mmseError, setMmseError] = useState('');

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', email: '' });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);
  const [credential, setCredential] = useState(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkError, setLinkError] = useState('');
  const [linking, setLinking] = useState(false);

  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [addPatientForm, setAddPatientForm] = useState({ name: '', email: '', password: '' });
  const [addPatientError, setAddPatientError] = useState('');
  const [addPatientSuccess, setAddPatientSuccess] = useState('');
  const [addingPatient, setAddingPatient] = useState(false);

  const [showAssignCaregiver, setShowAssignCaregiver] = useState(false);
  const [assignCaregiverId, setAssignCaregiverId] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => { loadOverview(); }, []);

  async function loadOverview() {
    setLoading(true);
    setLoadError('');
    const [pResult, cResult] = await Promise.allSettled([
      api.get('/doctor/patients'),
      api.get('/doctor/caregivers')
    ]);

    if (pResult.status === 'fulfilled') {
      setPatients(pResult.value.data.data || []);
    } else {
      const msg = pResult.reason?.response?.data?.message || pResult.reason?.message || 'Unknown error';
      console.error('Failed to load patients:', msg);
      setLoadError(`Patient list failed to load: ${msg}`);
    }

    if (cResult.status === 'fulfilled') {
      setCaregivers(cResult.value.data.data || []);
    } else {
      console.error('Failed to load caregivers:', cResult.reason?.message);
      // Caregivers failing does not block the patient view
    }

    setLoading(false);
  }

  async function openPatient(patient) {
    setSelectedPatient(patient);
    setActiveDetailTab('appointments');
    setView('detail');
    try {
      setDetailsLoading(true);
      const { data } = await api.get(`/doctor/patients/${patient.id}`);
      setDetails(data.data);
    } catch (err) {
      console.error('Patient details error:', err);
    } finally {
      setDetailsLoading(false);
    }
  }

  function backToOverview() {
    setView('overview');
    setSelectedPatient(null);
    setDetails(null);
    setShowApptForm(false);
    setShowMedForm(false);
    setShowMmseForm(false);
    setShowAssignCaregiver(false);
    setAssignSuccess('');
    setAssignError('');
  }

  async function handleDeletePatient(patient, e) {
    e.stopPropagation();
    if (!window.confirm(`Permanently delete ${patient.name} and all their data? This cannot be undone.`)) return;
    try {
      setDeletingPatient(patient.id);
      await api.delete(`/doctor/patients/${patient.id}`);
      await loadOverview();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete patient.');
    } finally {
      setDeletingPatient(null);
    }
  }

  async function refreshDetails() {
    if (!selectedPatient) return;
    const { data } = await api.get(`/doctor/patients/${selectedPatient.id}`);
    setDetails(data.data);
  }

  async function handleAddAppt() {
    if (!appt.title || !appt.appointmentDate) { setApptError('Title and date are required.'); return; }
    try {
      await api.post(`/doctor/patients/${selectedPatient.id}/appointments`, appt);
      setAppt({ title: '', doctorName: '', appointmentType: '', appointmentDate: '', notes: '' });
      setShowApptForm(false);
      setApptError('');
      await refreshDetails();
    } catch (err) {
      setApptError(err.response?.data?.message || 'Failed to add appointment.');
    }
  }

  async function handleDeleteAppt(id) {
    if (!window.confirm('Delete this appointment?')) return;
    await api.delete(`/doctor/appointments/${id}`);
    await refreshDetails();
  }

  async function handleAddMed() {
    if (!med.medicationName) { setMedError('Medication name is required.'); return; }
    try {
      await api.post(`/doctor/patients/${selectedPatient.id}/medications`, med);
      setMed({ medicationName: '', dosage: '', frequency: '', timing: '', startDate: '', notes: '' });
      setShowMedForm(false);
      setMedError('');
      await refreshDetails();
    } catch (err) {
      setMedError(err.response?.data?.message || 'Failed to add medication.');
    }
  }

  async function handleDeleteMed(id) {
    if (!window.confirm('Delete this medication?')) return;
    await api.delete(`/doctor/medications/${id}`);
    await refreshDetails();
  }

  async function handleAddMmse() {
    const score = parseInt(mmseEntry.score);
    if (isNaN(score) || score < 0 || score > 30) { setMmseError('Score must be 0–30.'); return; }
    if (!mmseEntry.assessmentDate) { setMmseError('Assessment date is required.'); return; }
    try {
      await api.post(`/doctor/patients/${selectedPatient.id}/mmse`, { ...mmseEntry, score });
      setMmseEntry({ score: '', assessmentDate: '', notes: '' });
      setShowMmseForm(false);
      setMmseError('');
      await refreshDetails();
    } catch (err) {
      setMmseError(err.response?.data?.message || 'Failed to add MMSE score.');
    }
  }

  async function handleCreatePatient() {
    const name = newPatient.name.trim();
    const email = newPatient.email.trim();
    if (!name || !email) { setCreateError('Name and email are required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setCreateError('Enter a valid email.'); return; }
    setCreating(true);
    setCreateError('');
    try {
      const { data } = await api.post('/doctor/team/patients', { name, email });
      setNewPatient({ name: '', email: '' });
      setShowCreateForm(false);
      setCredential({ name: data.data.name, email: data.data.email, password: data.data.defaultPassword });
      await loadOverview();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create patient.');
    } finally {
      setCreating(false);
    }
  }

  async function handleLinkCaregiver() {
    const email = linkEmail.trim();
    if (!email) { setLinkError('Email is required.'); return; }
    setLinking(true);
    setLinkError('');
    try {
      await api.post('/doctor/team/caregivers/link', { email });
      setLinkEmail('');
      setShowLinkForm(false);
      await loadOverview();
    } catch (err) {
      setLinkError(err.response?.data?.message || 'Failed to link caregiver.');
    } finally {
      setLinking(false);
    }
  }

  async function handleAddPatient() {
    const { name, email, password } = addPatientForm;
    if (!name.trim() || !email.trim() || !password.trim()) {
      setAddPatientError('Name, email, and password are required.');
      return;
    }
    setAddingPatient(true);
    setAddPatientError('');
    try {
      await api.post('/doctor/team/patients', { name: name.trim(), email: email.trim(), password });
      setAddPatientSuccess('Patient added successfully');
      setAddPatientForm({ name: '', email: '', password: '' });
      await loadOverview();
      setTimeout(() => { setShowAddPatientModal(false); setAddPatientSuccess(''); }, 2000);
    } catch (err) {
      setAddPatientError(err.response?.data?.message || 'Failed to add patient.');
    } finally {
      setAddingPatient(false);
    }
  }

  async function handleAssignCaregiver() {
    if (!assignCaregiverId) { setAssignError('Please select a caregiver.'); return; }
    const selectedCaregiver = caregivers.find(cg => String(cg.id) === String(assignCaregiverId));
    if (!selectedCaregiver) { setAssignError('Selected caregiver not found.'); return; }
    setAssigning(true);
    setAssignError('');
    try {
      await api.post('/doctor/team/caregivers/link', { email: selectedCaregiver.email });
      setAssignSuccess('Caregiver assigned successfully');
      setAssignCaregiverId('');
      await refreshDetails();
      await loadOverview();
      setTimeout(() => { setShowAssignCaregiver(false); setAssignSuccess(''); }, 2000);
    } catch (err) {
      setAssignError(err.response?.data?.message || 'Failed to assign caregiver.');
    } finally {
      setAssigning(false);
    }
  }

  const decliningCount = patients.filter(p => p.cognitiveStatus === 'Declining').length;
  const stableCount = patients.filter(p => p.cognitiveStatus === 'Stable').length;
  const alertPatients = patients.filter(p => p.hasAlert);

  const moodChartData = details?.moods
    ? [...details.moods].reverse().map(m => ({
        date: new Date(m.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: MOOD_SCORES[m.mood] || 5,
        mood: m.mood
      }))
    : [];

  const mmseChartData = details?.mmseScores?.map(s => ({
    date: new Date(s.assessmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
    score: s.score
  })) || [];

  if (loading) return (
    <div className="doc-loading">
      <div className="doc-spinner" />
      <p>Loading dashboard…</p>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // PATIENT DETAIL VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (view === 'detail' && selectedPatient) {
    return (
      <div className="doc-container">
        <div className="doc-detail-topbar">
          <button className="doc-back-btn" onClick={backToOverview}>← Back to Patients</button>
          <div className="doc-detail-heading">
            <h1 className="doc-detail-name">{selectedPatient.name}</h1>
            {selectedPatient.cognitiveStatus && (
              <span className="doc-cog-badge" style={getCognitiveStyle(selectedPatient.cognitiveStatus)}>
                {selectedPatient.cognitiveStatus}
              </span>
            )}
          </div>
          <button className="doc-add-btn" onClick={() => { setShowAssignCaregiver(v => !v); setAssignError(''); setAssignSuccess(''); }}>
            {showAssignCaregiver ? 'Cancel' : 'Assign Caregiver'}
          </button>
        </div>

        {showAssignCaregiver && (
          <div className="doc-form-card">
            <h3 className="doc-section-title" style={{ marginBottom: '0.75rem' }}>Assign Caregiver to {selectedPatient.name}</h3>
            <select className="doc-input" value={assignCaregiverId}
              onChange={e => { setAssignCaregiverId(e.target.value); setAssignError(''); }}>
              <option value="">Select a caregiver…</option>
              {caregivers.map(cg => (
                <option key={cg.id} value={cg.id}>{cg.name} ({cg.email})</option>
              ))}
            </select>
            {assignError && <p className="doc-error">{assignError}</p>}
            {assignSuccess && <p style={{ color: '#43a047', fontWeight: 600, marginTop: '0.5rem' }}>{assignSuccess}</p>}
            <button className="doc-save-btn" onClick={handleAssignCaregiver} disabled={assigning}>
              {assigning ? 'Assigning…' : 'Assign Caregiver'}
            </button>
          </div>
        )}

        {detailsLoading || !details ? (
          <div className="doc-loading"><div className="doc-spinner" /><p>Loading patient data…</p></div>
        ) : (
          <>
            <div className="doc-summary-strip">
              <div className="doc-summary-item">
                <span className="doc-summary-label">Wellness</span>
                <span className="doc-summary-val" style={{ color: getWellnessColor(details.wellnessScore) }}>
                  {details.wellnessScore ? `${details.wellnessScore}/10` : 'N/A'}
                </span>
              </div>
              <div className="doc-summary-item">
                <span className="doc-summary-label">Latest MMSE</span>
                <span className="doc-summary-val">
                  {details.latestMmseScore !== null ? `${details.latestMmseScore}/30` : 'N/A'}
                </span>
              </div>
              <div className="doc-summary-item">
                <span className="doc-summary-label">Caregiver</span>
                <span className="doc-summary-val doc-summary-val--sm">
                  {details.assignedCaregiver?.name || 'Unassigned'}
                </span>
              </div>
              <div className="doc-summary-item">
                <span className="doc-summary-label">Mood Check-ins</span>
                <span className="doc-summary-val">{details.moods.length}</span>
              </div>
              <div className="doc-summary-item">
                <span className="doc-summary-label">Memories</span>
                <span className="doc-summary-val">{details.photoCount}</span>
              </div>
            </div>

            <div className="doc-detail-tabs">
              {['appointments', 'medications', 'mmse', 'mood', 'notes'].map(tab => (
                <button
                  key={tab}
                  className={`doc-detail-tab ${activeDetailTab === tab ? 'doc-detail-tab--active' : ''}`}
                  onClick={() => setActiveDetailTab(tab)}
                >
                  {tab === 'appointments' && '📋 Appointments'}
                  {tab === 'medications' && '💊 Medications'}
                  {tab === 'mmse' && '🧠 MMSE Scores'}
                  {tab === 'mood' && '😊 Mood History'}
                  {tab === 'notes' && '📝 Care Notes'}
                </button>
              ))}
            </div>

            {/* APPOINTMENTS */}
            {activeDetailTab === 'appointments' && (
              <div className="doc-section">
                <div className="doc-section-header">
                  <h2 className="doc-section-title">Appointments</h2>
                  <button className="doc-add-btn" onClick={() => setShowApptForm(v => !v)}>
                    {showApptForm ? 'Cancel' : '+ Add Appointment'}
                  </button>
                </div>
                {showApptForm && (
                  <div className="doc-form-card">
                    <div className="doc-form-grid">
                      <input className="doc-input" placeholder="Title *" value={appt.title}
                        onChange={e => setAppt(p => ({ ...p, title: e.target.value }))} />
                      <input className="doc-input" placeholder="Doctor / Provider name" value={appt.doctorName}
                        onChange={e => setAppt(p => ({ ...p, doctorName: e.target.value }))} />
                      <input className="doc-input" placeholder="Type (checkup, therapy…)" value={appt.appointmentType}
                        onChange={e => setAppt(p => ({ ...p, appointmentType: e.target.value }))} />
                      <input className="doc-input" type="datetime-local" value={appt.appointmentDate}
                        onChange={e => setAppt(p => ({ ...p, appointmentDate: e.target.value }))} />
                      <textarea className="doc-input doc-textarea" placeholder="Notes (optional)" value={appt.notes}
                        onChange={e => setAppt(p => ({ ...p, notes: e.target.value }))} />
                    </div>
                    {apptError && <p className="doc-error">{apptError}</p>}
                    <button className="doc-save-btn" onClick={handleAddAppt}>Save Appointment</button>
                  </div>
                )}
                {details.appointments.length === 0 ? (
                  <p className="doc-empty">No appointments scheduled yet.</p>
                ) : (
                  <div className="doc-list">
                    {details.appointments.map(a => (
                      <div key={a.id} className="doc-list-item">
                        <div className="doc-list-icon">📋</div>
                        <div className="doc-list-body">
                          <p className="doc-list-title">{a.title}</p>
                          {a.doctorName && <p className="doc-list-sub">{a.doctorName}</p>}
                          {a.appointmentType && <p className="doc-list-sub">{a.appointmentType}</p>}
                          <p className="doc-list-date">{formatDateTime(a.appointmentDate)}</p>
                          {a.notes && <p className="doc-list-sub">{a.notes}</p>}
                        </div>
                        <button className="doc-del-btn" onClick={() => handleDeleteAppt(a.id)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MEDICATIONS */}
            {activeDetailTab === 'medications' && (
              <div className="doc-section">
                <div className="doc-section-header">
                  <h2 className="doc-section-title">Medications</h2>
                  <button className="doc-add-btn" onClick={() => setShowMedForm(v => !v)}>
                    {showMedForm ? 'Cancel' : '+ Add Medication'}
                  </button>
                </div>
                {showMedForm && (
                  <div className="doc-form-card">
                    <div className="doc-form-grid">
                      <input className="doc-input" placeholder="Medication name *" value={med.medicationName}
                        onChange={e => setMed(p => ({ ...p, medicationName: e.target.value }))} />
                      <input className="doc-input" placeholder="Dosage (e.g. 10mg)" value={med.dosage}
                        onChange={e => setMed(p => ({ ...p, dosage: e.target.value }))} />
                      <input className="doc-input" placeholder="Frequency (e.g. twice daily)" value={med.frequency}
                        onChange={e => setMed(p => ({ ...p, frequency: e.target.value }))} />
                      <input className="doc-input" placeholder="Timing (e.g. morning, with food)" value={med.timing}
                        onChange={e => setMed(p => ({ ...p, timing: e.target.value }))} />
                      <input className="doc-input" type="date" value={med.startDate}
                        onChange={e => setMed(p => ({ ...p, startDate: e.target.value }))} />
                      <textarea className="doc-input doc-textarea" placeholder="Notes (optional)" value={med.notes}
                        onChange={e => setMed(p => ({ ...p, notes: e.target.value }))} />
                    </div>
                    {medError && <p className="doc-error">{medError}</p>}
                    <button className="doc-save-btn" onClick={handleAddMed}>Save Medication</button>
                  </div>
                )}
                {details.medications.length === 0 ? (
                  <p className="doc-empty">No medications prescribed yet.</p>
                ) : (
                  <div className="doc-list">
                    {details.medications.map(m => (
                      <div key={m.id} className="doc-list-item">
                        <div className="doc-list-icon">💊</div>
                        <div className="doc-list-body">
                          <p className="doc-list-title">{m.medicationName}</p>
                          {m.dosage && <p className="doc-list-sub">Dose: {m.dosage}</p>}
                          {m.frequency && <p className="doc-list-sub">Frequency: {m.frequency}</p>}
                          {m.timing && <p className="doc-list-sub">Timing: {m.timing}</p>}
                          {m.startDate && <p className="doc-list-sub">Started: {formatDate(m.startDate)}</p>}
                          {m.notes && <p className="doc-list-sub">{m.notes}</p>}
                        </div>
                        <button className="doc-del-btn" onClick={() => handleDeleteMed(m.id)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MMSE */}
            {activeDetailTab === 'mmse' && (
              <div className="doc-section">
                <div className="doc-section-header">
                  <h2 className="doc-section-title">MMSE Score Tracker</h2>
                  <button className="doc-add-btn" onClick={() => setShowMmseForm(v => !v)}>
                    {showMmseForm ? 'Cancel' : '+ Add Score'}
                  </button>
                </div>
                {showMmseForm && (
                  <div className="doc-form-card">
                    <div className="doc-form-grid">
                      <input className="doc-input" type="number" min="0" max="30"
                        placeholder="MMSE Score (0–30) *" value={mmseEntry.score}
                        onChange={e => setMmseEntry(p => ({ ...p, score: e.target.value }))} />
                      <input className="doc-input" type="date" value={mmseEntry.assessmentDate}
                        onChange={e => setMmseEntry(p => ({ ...p, assessmentDate: e.target.value }))} />
                      <textarea className="doc-input doc-textarea" placeholder="Clinical notes (optional)"
                        value={mmseEntry.notes}
                        onChange={e => setMmseEntry(p => ({ ...p, notes: e.target.value }))} />
                    </div>
                    {mmseError && <p className="doc-error">{mmseError}</p>}
                    <button className="doc-save-btn" onClick={handleAddMmse}>Save Score</button>
                  </div>
                )}
                <div className="doc-cog-legend">
                  <span style={getCognitiveStyle('Stable')}>24–30 Stable</span>
                  <span style={getCognitiveStyle('Needs Monitoring')}>18–23 Needs Monitoring</span>
                  <span style={getCognitiveStyle('Declining')}>0–17 Declining</span>
                </div>
                {mmseChartData.length === 0 ? (
                  <p className="doc-empty">No MMSE scores recorded yet.</p>
                ) : (
                  <>
                    <div className="doc-chart-wrap">
                      <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={mmseChartData} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#90a4ae' }} />
                          <YAxis domain={[0, 30]} tick={{ fontSize: 11, fill: '#90a4ae' }} />
                          <Tooltip
                            contentStyle={{ borderRadius: '10px', border: '1px solid #c8e6c9', fontSize: 13 }}
                            formatter={v => [`${v}/30`, 'MMSE Score']}
                          />
                          <ReferenceLine y={24} stroke="#43a047" strokeDasharray="4 2" label={{ value: 'Stable', fill: '#43a047', fontSize: 11 }} />
                          <ReferenceLine y={18} stroke="#fb8c00" strokeDasharray="4 2" label={{ value: 'Monitoring', fill: '#fb8c00', fontSize: 11 }} />
                          <Line type="monotone" dataKey="score" stroke="#2e7d32" strokeWidth={2.5}
                            dot={{ fill: '#2e7d32', r: 5 }} activeDot={{ r: 7 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="doc-list">
                      {[...details.mmseScores].reverse().map(s => (
                        <div key={s.id} className="doc-list-item">
                          <div className="doc-list-icon">🧠</div>
                          <div className="doc-list-body">
                            <p className="doc-list-title">
                              Score: <strong>{s.score}/30</strong>
                              <span className="doc-cog-badge doc-cog-badge--sm"
                                style={getCognitiveStyle(s.score >= 24 ? 'Stable' : s.score >= 18 ? 'Needs Monitoring' : 'Declining')}>
                                {s.score >= 24 ? 'Stable' : s.score >= 18 ? 'Needs Monitoring' : 'Declining'}
                              </span>
                            </p>
                            <p className="doc-list-date">{formatDate(s.assessmentDate)}</p>
                            {s.notes && <p className="doc-list-sub">{s.notes}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* MOOD HISTORY */}
            {activeDetailTab === 'mood' && (
              <div className="doc-section">
                <h2 className="doc-section-title">Mood History</h2>
                {details.moods.length === 0 ? (
                  <p className="doc-empty">No mood check-ins recorded yet.</p>
                ) : (
                  <>
                    <div className="doc-chart-wrap">
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={moodChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#90a4ae' }} />
                          <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#90a4ae' }} />
                          <Tooltip
                            formatter={(v, n, props) => [props.payload.mood, 'Mood']}
                            contentStyle={{ borderRadius: '10px', border: '1px solid #c8e6c9', fontSize: 13 }}
                          />
                          <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                            {moodChartData.map((entry, i) => (
                              <Cell key={i} fill={getMoodBarColor(entry.mood)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="doc-list">
                      {details.moods.map((m, i) => (
                        <div key={i} className="doc-list-item">
                          <div className="doc-list-icon">{MOOD_EMOJI[m.mood] || '😐'}</div>
                          <div className="doc-list-body">
                            <p className="doc-list-title">{m.mood}</p>
                            <p className="doc-list-date">{formatDate(m.recordedAt)}</p>
                            {m.note && <p className="doc-list-sub">"{m.note}"</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* CARE NOTES — read-only */}
            {activeDetailTab === 'notes' && (
              <div className="doc-section">
                <div className="doc-section-header">
                  <h2 className="doc-section-title">Care Notes</h2>
                  <span className="doc-readonly-badge">Written by Caregiver</span>
                </div>
                {!details.careNotes || details.careNotes.length === 0 ? (
                  <p className="doc-empty">No care notes from caregiver yet.</p>
                ) : (
                  <div className="doc-list">
                    {details.careNotes.map(n => (
                      <div key={n.id} className="doc-list-item doc-note-item">
                        <div className="doc-list-icon">📝</div>
                        <div className="doc-list-body">
                          <p className="doc-list-title">{n.note}</p>
                          <p className="doc-list-date">{formatDate(n.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TEAM MANAGEMENT VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (view === 'team') {
    return (
      <div className="doc-container">
        <div className="doc-detail-topbar">
          <button className="doc-back-btn" onClick={() => setView('overview')}>← Back to Dashboard</button>
          <h1 className="doc-page-title">Team Management</h1>
        </div>

        {credential && (
          <div className="doc-credential-banner">
            <div className="doc-credential-content">
              <strong>Patient account created!</strong>
              <span>Share credentials with <em>{credential.name}</em>:</span>
              <code>{credential.email}</code>
              <span className="doc-cred-sep">/</span>
              <code>{credential.password}</code>
            </div>
            <button className="doc-cred-close" onClick={() => setCredential(null)}>✕</button>
          </div>
        )}

        <div className="doc-section">
          <div className="doc-section-header">
            <h2 className="doc-section-title">Create Patient Account</h2>
            <button className="doc-add-btn" onClick={() => { setShowCreateForm(v => !v); setCreateError(''); }}>
              {showCreateForm ? 'Cancel' : '+ Create Patient'}
            </button>
          </div>
          {showCreateForm && (
            <div className="doc-form-card">
              <div className="doc-form-grid doc-form-grid--2col">
                <input className="doc-input" placeholder="Full name *" value={newPatient.name}
                  onChange={e => { setNewPatient(p => ({ ...p, name: e.target.value })); setCreateError(''); }} />
                <input className="doc-input" type="email" placeholder="Email address *" value={newPatient.email}
                  onChange={e => { setNewPatient(p => ({ ...p, email: e.target.value })); setCreateError(''); }} />
              </div>
              {createError && <p className="doc-error">{createError}</p>}
              <button className="doc-save-btn" onClick={handleCreatePatient} disabled={creating}>
                {creating ? 'Creating…' : 'Create Patient'}
              </button>
            </div>
          )}
        </div>

        <div className="doc-section">
          <div className="doc-section-header">
            <h2 className="doc-section-title">Link Caregiver</h2>
            <button className="doc-add-btn" onClick={() => { setShowLinkForm(v => !v); setLinkError(''); }}>
              {showLinkForm ? 'Cancel' : '+ Link Caregiver'}
            </button>
          </div>
          {showLinkForm && (
            <div className="doc-form-card">
              <p className="doc-form-hint">Enter the email of a registered caregiver to link them to your team.</p>
              <div className="doc-form-grid doc-form-grid--2col">
                <input className="doc-input" type="email" placeholder="Caregiver email *" value={linkEmail}
                  onChange={e => { setLinkEmail(e.target.value); setLinkError(''); }} />
                <button className="doc-save-btn" onClick={handleLinkCaregiver} disabled={linking}>
                  {linking ? 'Linking…' : 'Link Caregiver'}
                </button>
              </div>
              {linkError && <p className="doc-error">{linkError}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // OVERVIEW
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="doc-container">
      <div className="doc-header">
        <div>
          <div className="doc-role-badge">🩺 Doctor</div>
          <h1 className="doc-title">Dr. {displayName}'s Dashboard</h1>
          <p className="doc-subtitle">{user?.profile?.specialization || 'Virtual Memory Companion'}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="doc-add-btn" onClick={() => { setShowAddPatientModal(true); setAddPatientError(''); setAddPatientSuccess(''); }}>+ Add Patient</button>
          <button className="doc-team-btn" onClick={() => setView('team')}>Manage Team</button>
        </div>
      </div>

      {loadError && (
        <div className="doc-load-error">
          <strong>Error loading dashboard:</strong> {loadError}
          <button onClick={loadOverview} className="doc-retry-btn">Retry</button>
        </div>
      )}

      {/* Stats */}
      <div className="doc-stats-row">
        <div className="doc-stat-card">
          <p className="doc-stat-val">{patients.length}</p>
          <p className="doc-stat-lbl">Total Patients</p>
        </div>
        <div className="doc-stat-card">
          <p className="doc-stat-val">{caregivers.length}</p>
          <p className="doc-stat-lbl">Total Caregivers</p>
        </div>
        <div className="doc-stat-card">
          <p className="doc-stat-val" style={{ color: stableCount > 0 ? '#43a047' : '#757575' }}>{stableCount}</p>
          <p className="doc-stat-lbl">Stable</p>
        </div>
        <div className="doc-stat-card">
          <p className="doc-stat-val" style={{ color: decliningCount > 0 ? '#e53935' : '#757575' }}>{decliningCount}</p>
          <p className="doc-stat-lbl">Declining</p>
        </div>
      </div>

      {/* Alerts */}
      {alertPatients.length > 0 && (
        <div className="doc-alerts-section">
          <h2 className="doc-alerts-title">⚠ Patients Needing Attention Today</h2>
          <div className="doc-alerts-list">
            {alertPatients.map(p => (
              <div key={p.id} className="doc-alert-item">
                <span className="doc-alert-name">{p.name}</span>
                <span className="doc-alert-mood">
                  {p.latestMoodEmoji} Feeling {p.latestMood} — Wellness {p.wellnessScore}/10
                </span>
                <button className="doc-view-btn-sm" onClick={() => openPatient(p)}>View</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patients Grid */}
      <h2 className="doc-patients-heading">All Patients</h2>
      {patients.length === 0 ? (
        <div className="doc-empty-state">
          <p className="doc-empty-icon">👥</p>
          <p className="doc-empty-title">No patients in the system yet</p>
          <p className="doc-empty-sub">Use Manage Team to create patient accounts.</p>
          <button className="doc-team-btn" onClick={() => setView('team')}>Manage Team</button>
        </div>
      ) : (
        <div className="doc-patients-grid">
          {patients.map(p => (
            <div
              key={p.id}
              className={`doc-patient-card ${p.hasAlert ? 'doc-patient-card--alert' : ''}`}
            >
              {p.hasAlert && <div className="doc-alert-chip">⚠ Needs Attention</div>}
              <div className="doc-patient-avatar">👤</div>
              <h3 className="doc-patient-name">{p.name}</h3>

              <div className="doc-patient-mood">
                {p.latestMood
                  ? <>{p.latestMoodEmoji} <span>{p.latestMood}</span></>
                  : <span className="doc-no-data">No mood check-in</span>}
              </div>

              <div className="doc-patient-scores">
                <div className="doc-score-pill">
                  <span className="doc-score-lbl">Wellness</span>
                  <span className="doc-score-val" style={{ color: getWellnessColor(p.wellnessScore) }}>
                    {p.wellnessScore ? `${p.wellnessScore}/10` : 'N/A'}
                  </span>
                </div>
                <div className="doc-score-pill">
                  <span className="doc-score-lbl">MMSE</span>
                  <span className="doc-score-val">
                    {p.latestMmseScore !== null ? `${p.latestMmseScore}/30` : 'N/A'}
                  </span>
                </div>
              </div>

              {p.cognitiveStatus && (
                <span className="doc-cog-badge" style={getCognitiveStyle(p.cognitiveStatus)}>
                  {p.cognitiveStatus}
                </span>
              )}

              <p className="doc-patient-caregiver">
                👩‍⚕️ {p.assignedCaregiver ? p.assignedCaregiver.name : 'No caregiver assigned'}
              </p>

              <div className="doc-card-actions">
                <button className="doc-view-btn" onClick={() => openPatient(p)}>View</button>
                <button
                  className="doc-delete-btn"
                  onClick={(e) => handleDeletePatient(p, e)}
                  disabled={deletingPatient === p.id}
                >
                  {deletingPatient === p.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="doc-form-card" style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>
            <button className="doc-cred-close" style={{ position: 'absolute', top: '1rem', right: '1rem' }}
              onClick={() => { setShowAddPatientModal(false); setAddPatientError(''); setAddPatientSuccess(''); }}>✕</button>
            <h2 className="doc-section-title" style={{ marginBottom: '1rem' }}>Add Patient</h2>
            <div className="doc-form-grid">
              <input className="doc-input" placeholder="Full name *" value={addPatientForm.name}
                onChange={e => { setAddPatientForm(p => ({ ...p, name: e.target.value })); setAddPatientError(''); }} />
              <input className="doc-input" type="email" placeholder="Email address *" value={addPatientForm.email}
                onChange={e => { setAddPatientForm(p => ({ ...p, email: e.target.value })); setAddPatientError(''); }} />
              <input className="doc-input" type="password" placeholder="Password *" value={addPatientForm.password}
                onChange={e => { setAddPatientForm(p => ({ ...p, password: e.target.value })); setAddPatientError(''); }} />
            </div>
            {addPatientError && <p className="doc-error">{addPatientError}</p>}
            {addPatientSuccess && <p style={{ color: '#43a047', fontWeight: 600, marginTop: '0.5rem' }}>{addPatientSuccess}</p>}
            <button className="doc-save-btn" onClick={handleAddPatient} disabled={addingPatient}>
              {addingPatient ? 'Adding…' : 'Add Patient'}
            </button>
          </div>
        </div>
      )}

      {/* Caregivers Section */}
      <h2 className="doc-patients-heading" style={{ marginTop: '2rem' }}>All Caregivers</h2>
      {caregivers.length === 0 ? (
        <div className="doc-empty-state">
          <p className="doc-empty-icon">👩‍⚕️</p>
          <p className="doc-empty-title">No caregivers registered yet</p>
          <p className="doc-empty-sub">Use Manage Team to link caregivers to your team.</p>
        </div>
      ) : (
        <div className="doc-caregivers-grid">
          {caregivers.map(cg => (
            <div key={cg.id} className="doc-caregiver-card">
              <div className="doc-cg-avatar">👩‍⚕️</div>
              <h3 className="doc-cg-name">{cg.name}</h3>
              <p className="doc-cg-email">{cg.email}</p>
              {cg.phone && <p className="doc-cg-phone">📞 {cg.phone}</p>}
              <div className="doc-cg-patient-badge">
                {cg.patientCount} patient{cg.patientCount !== 1 ? 's' : ''}
              </div>
              {cg.patientNames.length > 0 && (
                <div className="doc-cg-patient-list">
                  {cg.patientNames.map((name, i) => (
                    <span key={i} className="doc-cg-patient-tag">{name}</span>
                  ))}
                </div>
              )}
              {cg.lastActivityDate && (
                <p className="doc-cg-activity">Last active: {formatDate(cg.lastActivityDate)}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
