import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Heart, Brain, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'patient') {
        navigate('/patient-dashboard');
      } else if (user.role === 'caregiver') {
        navigate('/caregiver-dashboard');
      } else if (user.role === 'admin') {
        navigate('/role-selection');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await login(formData.email, formData.password);
      const userRole = response.data.user.role;

      // Navigate based on user role
      if (userRole === 'patient') {
        navigate('/patient-dashboard');
      } else if (userRole === 'caregiver') {
        navigate('/caregiver-dashboard');
      } else if (userRole === 'admin') {
        // Admin can choose which view to see
        navigate('/role-selection');
      } else {
        navigate('/role-selection');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message ||
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo Section */}
        <div className="login-header">
          <div className="logo-wrapper">
            <Brain size={48} className="logo-icon" />
            <Heart size={32} className="heart-icon" fill="currentColor" />
          </div>
          <h1 className="login-title">Virtual Memory Companion</h1>
          <p className="login-subtitle">Supporting Memory, Strengthening Connection</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail size={20} />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your email"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <Lock size={20} />
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your password"
              required
              autoComplete="current-password"
            />
          </div>

          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" defaultChecked />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Credentials Info */}
        <div className="demo-info">
          <p className="demo-title">🔑 Test Credentials (Available for Testing)</p>
          <div className="demo-credentials">
            <p><strong>Patient:</strong> sarah.patient@vamora.com / testpass123</p>
            <p><strong>Caregiver:</strong> amna.caregiver@vamora.com / password123</p>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>Don't have an account? <Link to="/register" className="signup-link">Sign Up</Link></p>
          <p className="privacy-text">Protected by industry-standard encryption</p>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="background-decoration">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>
    </div>
  );
};

export default Login;

