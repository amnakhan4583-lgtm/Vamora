import api from './api';

export async function getPatients() {
  const res = await api.get('/doctor/patients');
  return res.data.data;
}

export async function getCaregivers() {
  const res = await api.get('/doctor/caregivers');
  return res.data.data;
}

export async function createPatient({ name, email }) {
  const res = await api.post('/doctor/patients', { name, email });
  return res.data.data;
}

export async function linkCaregiver(email) {
  const res = await api.post('/doctor/caregivers/link', { email });
  return res.data.data;
}

export async function assignPatient(patientId, caregiverId) {
  const res = await api.post(`/doctor/patients/${patientId}/assign`, { caregiverId });
  return res.data;
}

export async function unassignPatient(patientId, caregiverId) {
  const res = await api.delete(`/doctor/patients/${patientId}/assign/${caregiverId}`);
  return res.data;
}
