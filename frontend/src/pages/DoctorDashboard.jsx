import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, Users, UserPlus, Stethoscope, ChevronDown, ChevronUp, X, Link } from 'lucide-react';
import {
  getPatients,
  getCaregivers,
  createPatient,
  assignPatient,
  unassignPatient,
  linkCaregiver,
} from '../services/doctorService';
import './DoctorDashboard.css';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const emailFirstPart = user?.email?.split('@')[0]?.split('.')?.[0] || 'Doctor';
  const rawName = user?.profile?.name?.split(' ')[0] || emailFirstPart;
  const doctorName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  const [activeTab, setActiveTab] = useState('patients');
  const [patients, setPatients] = useState([]);
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // New-patient credential notification
  const [credential, setCredential] = useState(null);

  // Create patient form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPatient, setNewPatient] = useState({ name: '', email: '' });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  // Assign patient controls — one open at a time
  const [assigningPatientId, setAssigningPatientId] = useState(null);
  const [selectedCaregiverId, setSelectedCaregiverId] = useState('');

  // Caregiver detail expansion
  const [expandedCaregiverId, setExpandedCaregiverId] = useState(null);

  // Link caregiver form
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkEmail, setLinkEmail] = useState('');
  const [linkError, setLinkError] = useState('');
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [p, c] = await Promise.all([getPatients(), getCaregivers()]);
      setPatients(p);
      setCaregivers(c);
    } catch (err) {
      console.error('Failed to load doctor data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async () => {
    const name = newPatient.name.trim();
    const email = newPatient.email.trim();
    if (!name || !email) { setCreateError('Name and email are required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setCreateError('Enter a valid email address.'); return; }

    setCreating(true);
    setCreateError('');
    try {
      const created = await createPatient({ name, email });
      setPatients(prev => [created, ...prev]);
      setNewPatient({ name: '', email: '' });
      setShowCreateForm(false);
      // Show credential notification so doctor can share login details
      setCredential({ name: created.name, email: created.email, password: created.defaultPassword });
    } catch (err) {
      setCreateError(err.response?.data?.message || err.message || 'Failed to create patient.');
    } finally {
      setCreating(false);
    }
  };

  const handleAssign = async (patientId) => {
    if (!selectedCaregiverId) return;
    const cid = Number(selectedCaregiverId);
    await assignPatient(patientId, cid);
    setAssigningPatientId(null);
    setSelectedCaregiverId('');
    await loadData();
  };

  const handleUnassign = async (patientId, caregiverId) => {
    await unassignPatient(patientId, caregiverId);
    await loadData();
  };

  const handleLinkCaregiver = async () => {
    const email = linkEmail.trim();
    if (!email) { setLinkError('Caregiver email is required.'); return; }

    setLinking(true);
    setLinkError('');
    try {
      const linked = await linkCaregiver(email);
      setCaregivers(prev => [...prev, linked]);
      setLinkEmail('');
      setShowLinkForm(false);
    } catch (err) {
      setLinkError(err.response?.data?.message || err.message || 'Failed to link caregiver.');
    } finally {
      setLinking(false);
    }
  };

  const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const formatCurrentDate = () => currentTime.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const formatCurrentTime = () => currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  const unassignedCount = patients.filter(p => p.assignedCaregivers.length === 0).length;

  if (loading) return (
    <div className="dr-loading">
      <div className="dr-spinner" />
      <p>Loading dashboard…</p>
    </div>
  );

  return (
    <div className="dr-container">

      {/* ── Credential notification ── */}
      {credential && (
        <div className="dr-credential-banner">
          <div className="dr-credential-content">
            <strong>Patient account created!</strong>
            <span>Share these login credentials with <em>{credential.name}</em>:</span>
            <code>{credential.email}</code>
            <span className="dr-credential-sep">/</span>
            <code>{credential.password}</code>
          </div>
          <button className="dr-credential-close" onClick={() => setCredential(null)}>
            <X size={18} />
          </button>
        </div>
      )}

      {/* ── Header ── */}
      <div className="dr-header">
        <div className="dr-header-left">
          <div className="dr-role-badge">
            <Stethoscope size={16} />
            Doctor
          </div>
          <h1 className="dr-title">Welcome, Dr. {doctorName}</h1>
          <div className="dr-datetime">
            <span><Calendar size={16} />{formatCurrentDate()}</span>
            <span><Clock size={16} />{formatCurrentTime()}</span>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="dr-stats-row">
        <div className="dr-stat-card">
          <p className="dr-stat-value">{patients.length}</p>
          <p className="dr-stat-label">Total Patients</p>
        </div>
        <div className="dr-stat-card">
          <p className="dr-stat-value" style={{ color: unassignedCount > 0 ? '#e65100' : '#2e7d32' }}>
            {unassignedCount}
          </p>
          <p className="dr-stat-label">Unassigned</p>
        </div>
        <div className="dr-stat-card">
          <p className="dr-stat-value">{patients.length - unassignedCount}</p>
          <p className="dr-stat-label">Assigned</p>
        </div>
        <div className="dr-stat-card">
          <p className="dr-stat-value">{caregivers.length}</p>
          <p className="dr-stat-label">Caregivers</p>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="dr-tabs">
        <button
          className={`dr-tab ${activeTab === 'patients' ? 'dr-tab-active' : ''}`}
          onClick={() => setActiveTab('patients')}
        >
          <UserPlus size={18} /> Patients
        </button>
        <button
          className={`dr-tab ${activeTab === 'caregivers' ? 'dr-tab-active' : ''}`}
          onClick={() => setActiveTab('caregivers')}
        >
          <Users size={18} /> Caregivers
        </button>
      </div>

      {/* ══════════════ PATIENTS TAB ══════════════ */}
      {activeTab === 'patients' && (
        <div className="dr-tab-content">

          {/* Create patient */}
          <div className="dr-section-bar">
            <h2 className="dr-section-title">Patient Management</h2>
            <button
              className="dr-primary-btn"
              onClick={() => { setShowCreateForm(v => !v); setCreateError(''); }}
            >
              {showCreateForm ? 'Cancel' : '+ Create Patient'}
            </button>
          </div>

          {showCreateForm && (
            <div className="dr-form-card">
              <h3 className="dr-form-title">New Patient</h3>
              <div className="dr-form-row">
                <input
                  className="dr-input"
                  placeholder="Full name *"
                  value={newPatient.name}
                  onChange={e => { setNewPatient(p => ({ ...p, name: e.target.value })); setCreateError(''); }}
                />
                <input
                  className="dr-input"
                  placeholder="Email address *"
                  type="email"
                  value={newPatient.email}
                  onChange={e => { setNewPatient(p => ({ ...p, email: e.target.value })); setCreateError(''); }}
                />
                <button
                  className="dr-primary-btn"
                  onClick={handleCreatePatient}
                  disabled={creating}
                >
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
              {createError && <p className="dr-error">{createError}</p>}
            </div>
          )}

          {/* Patient list */}
          {patients.length === 0 ? (
            <div className="dr-empty">
              <p className="dr-empty-icon">👤</p>
              <p className="dr-empty-text">No patients yet</p>
              <p className="dr-empty-sub">Click "Create Patient" to add your first patient.</p>
            </div>
          ) : (
            <div className="dr-patient-list">
              {patients.map(patient => {
                const isAssigning = assigningPatientId === patient.id;
                const available = caregivers.filter(
                  cg => !patient.assignedCaregivers.some(a => a.id === cg.id)
                );

                return (
                  <div key={patient.id} className={`dr-patient-card ${patient.assignedCaregivers.length === 0 ? 'dr-card-unassigned' : ''}`}>
                    <div className="dr-patient-card-header">
                      <div className="dr-patient-avatar">👤</div>
                      <div className="dr-patient-info">
                        <h3 className="dr-patient-name">{patient.name}</h3>
                        <p className="dr-patient-email">{patient.email}</p>
                        <p className="dr-patient-date">Added {formatDate(patient.createdAt)}</p>
                      </div>
                      {patient.assignedCaregivers.length === 0 && (
                        <span className="dr-unassigned-chip">Unassigned</span>
                      )}
                    </div>

                    {/* Assigned caregivers chips */}
                    {patient.assignedCaregivers.length > 0 && (
                      <div className="dr-assigned-row">
                        <span className="dr-assigned-label">Assigned to:</span>
                        <div className="dr-chips">
                          {patient.assignedCaregivers.map(cg => (
                            <span key={cg.id} className="dr-chip">
                              {cg.name}
                              <button
                                className="dr-chip-remove"
                                onClick={() => handleUnassign(patient.id, cg.id)}
                                title={`Remove ${cg.name}`}
                              >
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assign control */}
                    {caregivers.length === 0 ? (
                      <p className="dr-no-cg-hint">Link caregivers in the Caregivers tab to assign them.</p>
                    ) : available.length > 0 && (
                      <div className="dr-assign-row">
                        {!isAssigning ? (
                          <button
                            className="dr-assign-btn"
                            onClick={() => { setAssigningPatientId(patient.id); setSelectedCaregiverId(''); }}
                          >
                            + Assign to Caregiver
                          </button>
                        ) : (
                          <div className="dr-assign-form">
                            <select
                              className="dr-select"
                              value={selectedCaregiverId}
                              onChange={e => setSelectedCaregiverId(e.target.value)}
                            >
                              <option value="">Select a caregiver…</option>
                              {available.map(cg => (
                                <option key={cg.id} value={cg.id}>
                                  {cg.name} — {cg.specialization}
                                </option>
                              ))}
                            </select>
                            <button
                              className="dr-primary-btn"
                              onClick={() => handleAssign(patient.id)}
                              disabled={!selectedCaregiverId}
                            >
                              Confirm
                            </button>
                            <button
                              className="dr-ghost-btn"
                              onClick={() => setAssigningPatientId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════ CAREGIVERS TAB ══════════════ */}
      {activeTab === 'caregivers' && (
        <div className="dr-tab-content">
          <div className="dr-section-bar">
            <h2 className="dr-section-title">Caregiver Overview</h2>
            <button
              className="dr-primary-btn"
              onClick={() => { setShowLinkForm(v => !v); setLinkError(''); setLinkEmail(''); }}
            >
              {showLinkForm ? 'Cancel' : <><Link size={16} /> Link Caregiver</>}
            </button>
          </div>

          {showLinkForm && (
            <div className="dr-form-card">
              <h3 className="dr-form-title">Link an Existing Caregiver</h3>
              <p className="dr-form-hint">Enter the email address of a caregiver who is already registered.</p>
              <div className="dr-form-row">
                <input
                  className="dr-input"
                  placeholder="Caregiver email *"
                  type="email"
                  value={linkEmail}
                  onChange={e => { setLinkEmail(e.target.value); setLinkError(''); }}
                />
                <button className="dr-primary-btn" onClick={handleLinkCaregiver} disabled={linking}>
                  {linking ? 'Linking…' : 'Link'}
                </button>
              </div>
              {linkError && <p className="dr-error">{linkError}</p>}
            </div>
          )}

          {caregivers.length === 0 ? (
            <div className="dr-empty">
              <p className="dr-empty-icon">👥</p>
              <p className="dr-empty-text">No caregivers linked yet</p>
              <p className="dr-empty-sub">Use "Link Caregiver" to add caregivers to your team.</p>
            </div>
          ) : (
            <div className="dr-caregiver-list">
              {caregivers.map(cg => {
                const isExpanded = expandedCaregiverId === cg.id;
                return (
                  <div key={cg.id} className="dr-caregiver-card">
                    <button
                      className="dr-caregiver-card-header"
                      onClick={() => setExpandedCaregiverId(isExpanded ? null : cg.id)}
                    >
                      <div className="dr-cg-avatar">👩‍⚕️</div>
                      <div className="dr-cg-info">
                        <h3 className="dr-cg-name">{cg.name}</h3>
                        <p className="dr-cg-email">{cg.email}</p>
                        <p className="dr-cg-spec">{cg.specialization}</p>
                      </div>
                      <div className="dr-cg-meta">
                        <span className={`dr-patient-count-badge ${cg.patientCount === 0 ? 'dr-badge-empty' : ''}`}>
                          {cg.patientCount} patient{cg.patientCount !== 1 ? 's' : ''}
                        </span>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="dr-cg-detail">
                        <p className="dr-cg-detail-label">
                          Joined {formatDate(cg.joinedAt)}
                        </p>
                        <h4 className="dr-cg-patients-title">Assigned Patients</h4>
                        {cg.assignedPatients.length === 0 ? (
                          <p className="dr-cg-no-patients">
                            No patients assigned yet. Use the Patients tab to assign.
                          </p>
                        ) : (
                          <div className="dr-cg-patient-list">
                            {cg.assignedPatients.map(p => (
                              <div key={p.id} className="dr-cg-patient-row">
                                <span className="dr-cg-patient-name">{p.name}</span>
                                <span className="dr-cg-patient-email">{p.email}</span>
                                <button
                                  className="dr-unassign-btn"
                                  onClick={() => handleUnassign(p.id, cg.id)}
                                  title="Remove assignment"
                                >
                                  <X size={14} /> Unassign
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
