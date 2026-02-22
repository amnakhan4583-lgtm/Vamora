import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, LogOut, Brain, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Don't show navbar on authentication pages
  const authPages = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
  if (authPages.includes(location.pathname)) return null;

  // Pages where back button should not be shown (landing pages after login)
  const noBackPages = ['/role-selection', '/patient-dashboard', '/caregiver-dashboard'];
  const shouldShowBack = !noBackPages.includes(location.pathname);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {shouldShowBack && (
          <button onClick={handleBack} className="nav-button back-button" title="Go back">
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
        )}

        <div className="navbar-brand">
          <Brain size={24} className="brand-icon" />
          <Heart size={16} className="brand-heart" fill="currentColor" />
          <span className="brand-text">Vamora</span>
        </div>
      </div>

      <div className="navbar-right">
        {user && (
          <>
            <div className="user-badge">
              <span className="user-name">{user.profile?.name || user.email}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <button onClick={handleLogout} className="nav-button logout-button" title="Logout">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
