import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Heart, Users, Stethoscope } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './RoleSelection.css';

const RoleSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Auto-redirect based on user role
  useEffect(() => {
    if (user) {
      if (user.role === 'patient') {
        navigate('/patient-dashboard', { replace: true });
      } else if (user.role === 'caregiver') {
        navigate('/caregiver-dashboard', { replace: true });
      } else if (user.role === 'doctor') {
        navigate('/doctor-dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  // Show role selection only for admins or as fallback
  return (
    <div className="role-selection-container">
      <header className="app-header">
        <h1 className="app-title">Virtual Memory Companion</h1>
        <p className="app-subtitle">Supporting Memory, Strengthening Connection</p>
      </header>

      <div className="role-cards-container">
        <div
          className="role-card patient-card"
          onClick={() => navigate('/patient-dashboard')}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && navigate('/patient-dashboard')}
        >
          <div className="card-icon-wrapper patient-icon">
            <User size={80} strokeWidth={1.5} />
            <Heart size={40} className="heart-overlay" fill="currentColor" />
          </div>
          <h2 className="card-title">I am a Patient</h2>
          <p className="card-description">Access your memories and talk to your companion</p>
        </div>

        <div
          className="role-card caregiver-card"
          onClick={() => navigate('/caregiver-dashboard')}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && navigate('/caregiver-dashboard')}
        >
          <div className="card-icon-wrapper caregiver-icon">
            <Users size={80} strokeWidth={1.5} />
            <Heart size={40} className="heart-overlay" fill="currentColor" />
          </div>
          <h2 className="card-title">I am a Caregiver</h2>
          <p className="card-description">Support your loved one's memory journey</p>
        </div>

        <div
          className="role-card doctor-card"
          onClick={() => navigate('/doctor-dashboard')}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && navigate('/doctor-dashboard')}
        >
          <div className="card-icon-wrapper doctor-icon">
            <Stethoscope size={80} strokeWidth={1.5} />
            <Heart size={40} className="heart-overlay" fill="currentColor" />
          </div>
          <h2 className="card-title">I am a Doctor</h2>
          <p className="card-description">Manage patients and coordinate caregiver assignments</p>
        </div>
      </div>

      <footer className="app-footer">
        <p>A compassionate tool for Alzheimer's & Dementia care</p>
      </footer>
    </div>
  );
};

export default RoleSelection;
