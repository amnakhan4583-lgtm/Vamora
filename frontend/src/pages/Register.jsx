import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Heart, Brain, AlertCircle, User, Calendar, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
    name: '',
    dateOfBirth: '',
    phone: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (!/\d/.test(formData.password)) {
      setError('Password must contain at least one number');
      setIsLoading(false);
      return;
    }

    try {
      const userData = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        name: formData.name
      };

      // Add optional fields based on role
      if (formData.role === 'patient' && formData.dateOfBirth) {
        userData.dateOfBirth = formData.dateOfBirth;
      }
      if (formData.role === 'caregiver' && formData.phone) {
        userData.phone = formData.phone;
      }

      const response = await register(userData);
      const userRole = response.data.user.role;

      // Navigate based on user role
      if (userRole === 'patient') {
        navigate('/patient-dashboard');
      } else if (userRole === 'caregiver') {
        navigate('/caregiver-dashboard');
      } else {
        navigate('/role-selection');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Logo Section */}
        <div className="register-header">
          <div className="logo-wrapper">
            <Brain size={48} className="logo-icon" />
            <Heart size={32} className="heart-icon" fill="currentColor" />
          </div>
          <h1 className="register-title">Create Your Account</h1>
          <p className="register-subtitle">Join Virtual Memory Companion</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="register-form">
          {/* Role Selection */}
          <div className="form-group">
            <label htmlFor="role" className="form-label">
              <User size={20} />
              I am a
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-select"
              required
            >
              <option value="patient">Patient</option>
              <option value="caregiver">Caregiver</option>
            </select>
          </div>

          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              <User size={20} />
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your full name"
              required
              minLength="2"
              maxLength="100"
            />
          </div>

          {/* Email */}
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

          {/* Conditional Fields - Patient */}
          {formData.role === 'patient' && (
            <div className="form-group">
              <label htmlFor="dateOfBirth" className="form-label">
                <Calendar size={20} />
                Date of Birth (Optional)
              </label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="form-input"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          )}

          {/* Conditional Fields - Caregiver */}
          {formData.role === 'caregiver' && (
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                <Phone size={20} />
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your phone number"
              />
            </div>
          )}

          {/* Password */}
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
              placeholder="Create a password"
              required
              autoComplete="new-password"
              minLength="6"
            />
            <small className="form-hint">At least 6 characters with one number</small>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              <Lock size={20} />
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div className="register-footer">
          <p>Already have an account? <Link to="/" className="login-link">Sign In</Link></p>
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

export default Register;
