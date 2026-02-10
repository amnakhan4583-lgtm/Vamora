import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Heart, Brain } from 'lucide-react';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();

  // Mock credentials pre-filled
  const [formData, setFormData] = useState({
    email: 'demo@vamora.com',
    password: 'demo123'
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to role selection after successful login
      navigate('/role-selection');
    }, 800);
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
            <a href="#" className="forgot-link">Forgot password?</a>
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
          <p className="demo-title">🔑 Demo Credentials (Pre-filled)</p>
          <div className="demo-credentials">
            <p><strong>Email:</strong> demo@vamora.com</p>
            <p><strong>Password:</strong> demo123</p>
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>Don't have an account? <a href="#" className="signup-link">Sign Up</a></p>
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
