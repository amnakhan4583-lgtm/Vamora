import { useState, useEffect } from 'react';
import { Camera, MessageCircle, Mic, Calendar, Clock, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './PatientDashboard.css';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [modalFeature, setModalFeature] = useState('');

  // Get patient name from profile
  const patientName = user?.profile?.name?.split(' ')[0] || 'Patient';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

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
      {/* Header Section */}
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

      {/* Main Content */}
      <main className="dashboard-main">
        <h2 className="section-title">My Memory Lane</h2>

        <div className="action-buttons-grid">
          {/* View Photos Button */}
          <button
            className="action-button photos-button"
            onClick={() => handleComingSoon('View Photos')}
            aria-label="View your photos and memories"
          >
            <div className="button-icon">
              <Camera size={64} strokeWidth={1.5} />
            </div>
            <h3 className="button-title">View Photos</h3>
            <p className="button-description">See your cherished memories</p>
          </button>

          {/* Talk to Companion Button */}
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

          {/* Add Memory Button */}
          <button
            className="action-button memory-button"
            onClick={() => handleComingSoon('Add Memory')}
            aria-label="Add a new memory"
          >
            <div className="button-icon">
              <Mic size={64} strokeWidth={1.5} />
            </div>
            <h3 className="button-title">Add Memory</h3>
            <p className="button-description">Record a voice note</p>
          </button>
        </div>

        {/* Quick Tips Section */}
        <div className="tips-section">
          <div className="tip-card">
            <p className="tip-text">💡 Tap any card to explore your memories</p>
          </div>
        </div>
      </main>

      {/* Coming Soon Modal */}
      {showComingSoonModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal} aria-label="Close modal">
              <X size={24} />
            </button>
            <div className="modal-icon">🚀</div>
            <h2 className="modal-title">Coming Soon!</h2>
            <p className="modal-description">
              The <strong>{modalFeature}</strong> feature is currently under development.
              We're working hard to bring you this amazing functionality soon!
            </p>
            <button className="modal-button" onClick={closeModal}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
