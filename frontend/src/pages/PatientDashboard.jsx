 import { useState, useEffect } from 'react';
import { Camera, MessageCircle, Smile, Calendar, Clock, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './PatientDashboard.css';

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [modalFeature, setModalFeature] = useState('');
  const patientName = user?.profile?.name?.split(' ')[0] || 'Patient';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = (date) => date.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const formatTime = (date) => date.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const handleComingSoon = (featureName) => {
    setModalFeature(featureName);
    setShowComingSoonModal(true);
  };

  const closeModal = () => {
    setShowComingSoonModal(false);
    setModalFeature('');
  };

  return (
    <div className="patient-dashboard-container">
      <header className="dashboard-header">
        <div className="greeting-section">
          <h1 className="greeting-title">{getGreeting()}, {patientName}!</h1>
          <div className="datetime-info">
            <div className="date-display">
              <Calendar size={28} />
              <span>{formatDate(currentTime)}</span>
            </div>
            <div className="time-display">
              <Clock size={28} />
              <span>{formatTime(currentTime)}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <h2 className="section-title">My Memory Lane</h2>

        <div className="action-buttons-grid">

          {/* 1st - My Memories */}
          <button
            className="action-button photos-button"
            onClick={() => navigate('/photo-gallery')}
            aria-label="View your photos and memories"
          >
            <div className="button-icon">
              <Camera size={64} strokeWidth={1.5} />
            </div>
            <h3 className="button-title">My Memories</h3>
            <p className="button-description">View and record your cherished memories</p>
          </button>

          {/* 2nd - Talk to Companion */}
          <button
            className="action-button companion-button"
            onClick={() => handleComingSoon('Talk to Companion')}
            aria-label="Talk to your memory companion"
          >
            <div className="button-icon">
              <MessageCircle size={64} strokeWidth={1.5} />
            </div>
            <h3 className="button-title">Talk to Companion</h3>
            <p className="button-description">Chat about your memories</p>
          </button>

          {/* 3rd - Mood Check-in */}
          <button
            className="action-button mood-button"
            onClick={() => navigate('/mood-checkin')}
            aria-label="Check in your mood"
          >
            <div className="button-icon">
              <Smile size={64} strokeWidth={1.5} />
            </div>
            <h3 className="button-title">How Are You Feeling?</h3>
            <p className="button-description">Share how you feel today</p>
          </button>

        </div>

        <div className="tips-section">
          <div className="tip-card">
            <p className="tip-text">💡 Tap any card to explore your memories</p>
          </div>
        </div>
      </main>

      {showComingSoonModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <X size={24} />
            </button>
            <div className="modal-icon">🚀</div>
            <h2 className="modal-title">Coming Soon!</h2>
            <p className="modal-description">
              The <strong>{modalFeature}</strong> feature is currently under development.
            </p>
            <button className="modal-button" onClick={closeModal}>Got it!</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;