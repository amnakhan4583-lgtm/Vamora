 import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import RoleSelection from './pages/RoleSelection';
import PatientDashboard from './pages/PatientDashboard';
import PhotoGallery from './pages/PhotoGallery';
import MoodCheckin from './pages/MoodCheckin';
import TalkToCompanion from './pages/TalkToCompanion';
import CaregiverDashboard from './pages/CaregiverDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/role-selection" element={<ProtectedRoute><RoleSelection /></ProtectedRoute>} />
          <Route path="/patient-dashboard" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
          <Route path="/photo-gallery" element={<ProtectedRoute allowedRoles={['patient']}><PhotoGallery /></ProtectedRoute>} />
          <Route path="/mood-checkin" element={<ProtectedRoute allowedRoles={['patient']}><MoodCheckin /></ProtectedRoute>} />
          <Route path="/talk-to-companion" element={<ProtectedRoute allowedRoles={['patient']}><TalkToCompanion /></ProtectedRoute>} />
          <Route path="/caregiver-dashboard" element={<ProtectedRoute allowedRoles={['caregiver']}><CaregiverDashboard /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;