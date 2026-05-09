import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Shield, Users, FileText, Lock, Unlock,
  Plus, Eye, EyeOff, LogOut, X, CheckCircle
} from 'lucide-react';
import './SuperAdminDashboard.css';

const roleBadgeStyle = (role) => {
  const map = {
    patient:     { background: '#e3f2fd', color: '#1565c0' },
    caregiver:   { background: '#e8f5e9', color: '#2e7d32' },
    doctor:      { background: '#f3e5f5', color: '#4a148c' },
    super_admin: { background: '#fff3e0', color: '#e65100' },
  };
  return map[role] || { background: '#f5f5f5', color: '#616161' };
};

const roleEmoji = (role) => {
  const map = { patient: '🧠', caregiver: '🤝', doctor: '🩺', super_admin: '🛡️' };
  return map[role] || '👤';
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const timeAgo = (d) => {
  if (!d) return '';
  const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return `${Math.floor(diff / 30)}mo ago`;
};

const TABS = [
  { key: 'create',  label: 'Create User',    Icon: Plus   },
  { key: 'users',   label: 'All Users',       Icon: Users  },
  { key: 'logs',    label: 'Logs',            Icon: FileText },
  { key: 'doctors', label: 'Doctor Access',  Icon: Shield },
];

const BLANK_FORM = {
  role: 'doctor', name: '', email: '', password: '',
  specialization: '', licenseNumber: '', phone: '', dateOfBirth: ''
};

const SuperAdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('create');
  const [showPw, setShowPw] = useState(false);

  // Create User
  const [form, setForm]           = useState(BLANK_FORM);
  const [creating, setCreating]   = useState(false);
  const [createError, setCreateError] = useState('');
  const [created, setCreated]     = useState(null);

  // All Users
  const [users, setUsers]           = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');

  // Logs
  const [logs, setLogs]             = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError]   = useState('');

  // Doctor Access
  const [doctors, setDoctors]           = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [doctorsError, setDoctorsError] = useState('');
  const [lockingId, setLockingId]       = useState(null);

  const loadUsers = useCallback(async () => {
    setUsersLoading(true); setUsersError('');
    try {
      const r = await api.get('/super-admin/users');
      setUsers(r.data);
    } catch (e) {
      setUsersError(e.response?.data?.message || 'Failed to load users.');
    } finally { setUsersLoading(false); }
  }, []);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true); setLogsError('');
    try {
      const r = await api.get('/super-admin/logs');
      setLogs(r.data);
    } catch (e) {
      setLogsError(e.response?.data?.message || 'Failed to load logs.');
    } finally { setLogsLoading(false); }
  }, []);

  const loadDoctors = useCallback(async () => {
    setDoctorsLoading(true); setDoctorsError('');
    try {
      const r = await api.get('/super-admin/users');
      setDoctors(r.data.filter(u => u.role === 'doctor'));
    } catch (e) {
      setDoctorsError(e.response?.data?.message || 'Failed to load doctors.');
    } finally { setDoctorsLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === 'users')   loadUsers();
    else if (activeTab === 'logs')    loadLogs();
    else if (activeTab === 'doctors') loadDoctors();
  }, [activeTab, loadUsers, loadLogs, loadDoctors]);

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (createError) setCreateError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCreating(true); setCreateError(''); setCreated(null);
    const { role, name, email, password, specialization, licenseNumber, phone, dateOfBirth } = form;
    const body = { name, email };
    if (password) body.password = password;
    if (role === 'doctor') {
      if (specialization) body.specialization = specialization;
      if (licenseNumber)  body.licenseNumber  = licenseNumber;
    }
    if (role === 'caregiver' && phone) body.phone = phone;
    if (role === 'patient' && dateOfBirth) body.dateOfBirth = dateOfBirth;
    try {
      const r = await api.post(`/super-admin/${role}s`, body);
      setCreated(r.data);
      setForm({ ...BLANK_FORM, role });
    } catch (e) {
      setCreateError(e.response?.data?.message || 'Failed to create user.');
    } finally { setCreating(false); }
  };

  const handleToggleLock = async (userId) => {
    setLockingId(userId);
    try {
      const r = await api.patch(`/super-admin/doctors/${userId}/lock`);
      setDoctors(prev => prev.map(d => d.id === userId ? { ...d, isLocked: r.data.isLocked } : d));
    } catch (e) {
      setDoctorsError(e.response?.data?.message || 'Failed to toggle lock.');
    } finally { setLockingId(null); }
  };

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <div className="sa-container">

      {/* ── Header ── */}
      <header className="sa-header">
        <div className="sa-header-left">
          <div className="sa-header-icon"><Shield size={32} /></div>
          <div>
            <h1 className="sa-header-title">Super Admin</h1>
            <p className="sa-header-sub">Vamora Control Panel · {user?.email}</p>
          </div>
        </div>
        <button className="sa-logout-btn" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </header>

      <div className="sa-body">

        {/* ── Tabs ── */}
        <div className="sa-tabs">
          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              className={`sa-tab${activeTab === key ? ' sa-tab--active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* ══ CREATE USER ══ */}
        {activeTab === 'create' && (
          <div className="sa-section">
            <h2 className="sa-section-title">Create New User</h2>

            {created && (
              <div className="sa-credential-banner">
                <CheckCircle size={22} />
                <div style={{ flex: 1 }}>
                  <strong>User created successfully!</strong>
                  <div className="sa-cred-row">
                    <span>Email:</span>
                    <code>{created.user?.email}</code>
                  </div>
                  <div className="sa-cred-row">
                    <span>Role:</span>
                    <code>{created.user?.role}</code>
                  </div>
                  {created.defaultPassword && (
                    <div className="sa-cred-row">
                      <span>Temp&nbsp;Password:</span>
                      <code>{created.defaultPassword}</code>
                    </div>
                  )}
                </div>
                <button className="sa-cred-close" onClick={() => setCreated(null)} title="Dismiss">×</button>
              </div>
            )}

            {createError && (
              <div className="sa-alert sa-alert--error">
                <X size={16} /> {createError}
              </div>
            )}

            <form className="sa-form" style={{ gap: '0.9rem' }} onSubmit={handleSubmit}>
              <div className="sa-form-group">
                <label className="sa-label">Role</label>
                <select className="sa-select" name="role" value={form.role} onChange={handleChange}>
                  <option value="doctor">Doctor</option>
                  <option value="caregiver">Caregiver</option>
                  <option value="patient">Patient</option>
                </select>
              </div>

              <div className="sa-form-grid">
                <div className="sa-form-group">
                  <label className="sa-label">Full Name *</label>
                  <input
                    className="sa-input" name="name" value={form.name}
                    onChange={handleChange} placeholder="e.g. Dr. Jane Smith" required
                  />
                </div>
                <div className="sa-form-group">
                  <label className="sa-label">Email Address *</label>
                  <input
                    className="sa-input" type="email" name="email" value={form.email}
                    onChange={handleChange} placeholder="jane@hospital.com" required
                  />
                </div>
              </div>

              <div className="sa-form-group">
                <label className="sa-label">
                  Password <span className="sa-label-hint">(leave blank to auto-generate)</span>
                </label>
                <div className="sa-password-wrap">
                  <input
                    className="sa-input"
                    type={showPw ? 'text' : 'password'}
                    name="password" value={form.password}
                    onChange={handleChange} placeholder="Auto-generated if left blank"
                  />
                  <button type="button" className="sa-eye-btn" onClick={() => setShowPw(p => !p)}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {form.role === 'doctor' && (
                <div className="sa-form-grid">
                  <div className="sa-form-group">
                    <label className="sa-label">Specialization</label>
                    <input className="sa-input" name="specialization" value={form.specialization} onChange={handleChange} placeholder="e.g. Neurology" />
                  </div>
                  <div className="sa-form-group">
                    <label className="sa-label">License Number</label>
                    <input className="sa-input" name="licenseNumber" value={form.licenseNumber} onChange={handleChange} placeholder="e.g. LIC-12345" />
                  </div>
                </div>
              )}

              {form.role === 'caregiver' && (
                <div className="sa-form-group">
                  <label className="sa-label">Phone</label>
                  <input className="sa-input" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 555 000 0000" />
                </div>
              )}

              {form.role === 'patient' && (
                <div className="sa-form-group">
                  <label className="sa-label">Date of Birth</label>
                  <input className="sa-input" type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} />
                </div>
              )}

              <button className="sa-submit-btn" type="submit" disabled={creating}>
                {creating
                  ? 'Creating…'
                  : `Create ${form.role.charAt(0).toUpperCase() + form.role.slice(1)}`}
              </button>
            </form>
          </div>
        )}

        {/* ══ ALL USERS ══ */}
        {activeTab === 'users' && (
          <div className="sa-section">
            <div className="sa-section-header">
              <h2 className="sa-section-title" style={{ marginBottom: 0 }}>All Users</h2>
              <button className="sa-refresh-btn" onClick={loadUsers} disabled={usersLoading}>
                {usersLoading ? 'Loading…' : 'Refresh'}
              </button>
            </div>

            {usersError && (
              <div className="sa-alert sa-alert--error"><X size={16} /> {usersError}</div>
            )}

            {usersLoading ? (
              <div className="sa-loading"><div className="sa-spinner" /></div>
            ) : (
              <div className="sa-table-wrap">
                <table className="sa-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={5} className="sa-empty">No users found.</td></tr>
                    ) : users.map(u => (
                      <tr key={u.id}>
                        <td className="sa-td-name">{u.name || '—'}</td>
                        <td className="sa-td-email">{u.email}</td>
                        <td>
                          <span className="sa-role-badge" style={roleBadgeStyle(u.role)}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          {u.isActive
                            ? <span className="sa-status-active">Active</span>
                            : <span className="sa-status-locked">Inactive</span>}
                          {u.isLocked && (
                            <span className="sa-status-locked" style={{ marginLeft: '0.4rem' }}>· Locked</span>
                          )}
                        </td>
                        <td className="sa-td-date">{formatDate(u.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ══ LOGS ══ */}
        {activeTab === 'logs' && (
          <div className="sa-section">
            <div className="sa-section-header">
              <div>
                <h2 className="sa-section-title" style={{ marginBottom: 0 }}>Activity Logs</h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#9e9e9e' }}>
                  Last 50 user registrations
                </p>
              </div>
              <button className="sa-refresh-btn" onClick={loadLogs} disabled={logsLoading}>
                {logsLoading ? 'Loading…' : 'Refresh'}
              </button>
            </div>

            {logsError && (
              <div className="sa-alert sa-alert--error"><X size={16} /> {logsError}</div>
            )}

            {logsLoading ? (
              <div className="sa-loading"><div className="sa-spinner" /></div>
            ) : (
              <div className="sa-log-list">
                {logs.length === 0 ? (
                  <p className="sa-empty">No log entries found.</p>
                ) : logs.map(entry => (
                  <div key={entry.id} className="sa-log-item">
                    <div className="sa-log-icon">{roleEmoji(entry.role)}</div>
                    <div className="sa-log-body">
                      <p className="sa-log-name">{entry.name || entry.email}</p>
                      <div className="sa-log-meta">
                        <span className="sa-role-badge" style={roleBadgeStyle(entry.role)}>
                          {entry.role.replace('_', ' ')}
                        </span>
                        {entry.name && (
                          <span className="sa-log-email">{entry.email}</span>
                        )}
                      </div>
                    </div>
                    <div className="sa-log-time">
                      <span className="sa-log-ago">{timeAgo(entry.createdAt)}</span>
                      <span className="sa-log-date">{formatDate(entry.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ DOCTOR ACCESS ══ */}
        {activeTab === 'doctors' && (
          <div className="sa-section">
            <div className="sa-section-header">
              <div>
                <h2 className="sa-section-title" style={{ marginBottom: 0 }}>Doctor Access Control</h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.82rem', color: '#9e9e9e' }}>
                  Lock or unlock doctor portal access
                </p>
              </div>
              <button className="sa-refresh-btn" onClick={loadDoctors} disabled={doctorsLoading}>
                {doctorsLoading ? 'Loading…' : 'Refresh'}
              </button>
            </div>

            {doctorsError && (
              <div className="sa-alert sa-alert--error"><X size={16} /> {doctorsError}</div>
            )}

            {doctorsLoading ? (
              <div className="sa-loading"><div className="sa-spinner" /></div>
            ) : (
              <div className="sa-doctor-grid">
                {doctors.length === 0 ? (
                  <p className="sa-empty">No doctors found.</p>
                ) : doctors.map(doc => (
                  <div
                    key={doc.id}
                    className={`sa-doctor-card${doc.isLocked ? ' sa-doctor-card--locked' : ''}`}
                  >
                    {doc.isLocked && <div className="sa-locked-chip">LOCKED</div>}
                    <div className="sa-doctor-avatar">🩺</div>
                    <p className="sa-doctor-name">{doc.name || '—'}</p>
                    <p className="sa-doctor-email">{doc.email}</p>
                    <div className={`sa-doctor-status ${doc.isLocked ? 'sa-status--locked' : 'sa-status--active'}`}>
                      {doc.isLocked ? <Lock size={13} /> : <Unlock size={13} />}
                      {doc.isLocked ? 'Locked' : 'Active'}
                    </div>
                    <button
                      className={`sa-lock-btn ${doc.isLocked ? 'sa-lock-btn--unlock' : 'sa-lock-btn--lock'}`}
                      onClick={() => handleToggleLock(doc.id)}
                      disabled={lockingId === doc.id}
                    >
                      {lockingId === doc.id
                        ? '…'
                        : doc.isLocked
                          ? <><Unlock size={14} /> Unlock Access</>
                          : <><Lock size={14} /> Lock Access</>
                      }
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default SuperAdminDashboard;
