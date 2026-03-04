 import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Camera, Calendar, Clock, Smile } from 'lucide-react';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
});

const CaregiverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const caregiverName = user?.profile?.name?.split(' ')[0] || 'Caregiver';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchPatients();
  }, []);

  const getToken = () => localStorage.getItem('token');

  const fetchPatients = async () => {
    try {
      const { data } = await api.get('/caregiver/patients', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setPatients(data.patients || []);
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  const fetchPatientPhotos = async (patientId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/caregiver/patients/${patientId}/photos`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setPhotos(data || []);
    } catch (err) {
      console.error('Error fetching photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    fetchPatientPhotos(patient.id);
  };

  const formatDate = (date) => date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const formatTime = (date) => date.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          Welcome, {caregiverName}!
        </h1>
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', color: '#666' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={18} /> {formatDate(currentTime)}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={18} /> {formatTime(currentTime)}
          </span>
        </div>
      </header>

      {/* Patients List */}
      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Your Patients</h2>
        {patients.length === 0 ? (
          <p style={{ color: '#888' }}>No patients assigned yet.</p>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {patients.map(patient => (
              <button
                key={patient.id}
                onClick={() => handleSelectPatient(patient)}
                style={{
                  padding: '1rem 1.5rem',
                  borderRadius: '12px',
                  border: selectedPatient?.id === patient.id ? '2px solid #6c63ff' : '2px solid #ddd',
                  background: selectedPatient?.id === patient.id ? '#f0eeff' : '#fff',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                👤 {patient.name}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Patient Photos */}
      {selectedPatient && (
        <section>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>
            📸 {selectedPatient.name}'s Memories
          </h2>

          {loading ? (
            <p>Loading photos...</p>
          ) : photos.length === 0 ? (
            <p style={{ color: '#888' }}>No photos uploaded yet.</p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              {photos.map(photo => (
                <div key={photo.id} style={{
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                  background: '#fff'
                }}>
                  <img
                    src={`http://localhost:5000${photo.filename}`}
                    alt={photo.caption}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '1rem' }}>
                    <p style={{ fontWeight: '500', marginBottom: '0.5rem' }}>{photo.caption}</p>
                    {photo.voiceNoteUrl && (
                      <audio controls src={`http://localhost:5000${photo.voiceNoteUrl}`}
                        style={{ width: '100%', marginTop: '0.5rem' }}
                      />
                    )}
                    <p style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.5rem' }}>
                      {new Date(photo.takenAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default CaregiverDashboard;
