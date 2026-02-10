import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import RoleSelection from './pages/RoleSelection';
import PatientDashboard from './pages/PatientDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/role-selection" element={<RoleSelection />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/caregiver-dashboard" element={<div style={{padding: '2rem', textAlign: 'center', fontSize: '2rem'}}>Caregiver Dashboard - Coming Soon</div>} />
      </Routes>
    </Router>
  );
}

export default App;
