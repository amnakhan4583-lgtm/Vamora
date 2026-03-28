 'use strict';
const express = require('express');
const router = express.Router();
const db = require('../../models');
const { authenticate } = require('../middlewares/auth');
const { Op } = require('sequelize');

// ─── Helper: Get Caregiver Profile ───────────────────────────────────────────
const getCaregiverProfile = async (userId) => {
  return await db.Caregiver.findOne({ where: { userId } });
};

// ─── Helper: Calculate Wellness Score ────────────────────────────────────────
const calculateWellnessScore = (moods) => {
  if (!moods || moods.length === 0) return null;
  const scores = { happy: 10, excited: 10, calm: 8, tired: 5, confused: 4, anxious: 3, frustrated: 3, sad: 2 };
  const total = moods.reduce((sum, m) => sum + (scores[m.mood] || 5), 0);
  return Math.round(total / moods.length);
};

// ─── GET All Assigned Patients ────────────────────────────────────────────────
router.get('/patients', authenticate, async (req, res) => {
  try {
    const caregiver = await getCaregiverProfile(req.user.id);
    if (!caregiver) return res.status(404).json({ error: 'Caregiver profile not found.' });

    const patients = await db.Patient.findAll({
      include: [{
        model: db.Caregiver,
        as: 'caregivers',
        where: { id: caregiver.id },
        attributes: []
      }]
    });

    const patientData = await Promise.all(patients.map(async (p) => {
      const latestMood = await db.Mood.findOne({
        where: { patientId: p.userId },
        order: [['recordedAt', 'DESC']]
      });

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const recentMoods = await db.Mood.findAll({
        where: { patientId: p.userId, recordedAt: { [Op.gte]: weekAgo } },
        order: [['recordedAt', 'DESC']]
      });

      const photoCount = await db.Photo.count({ where: { patientId: p.userId } });
      const wellnessScore = calculateWellnessScore(recentMoods);

      const today = new Date();
      const moodDate = latestMood ? new Date(latestMood.recordedAt) : null;
      const isMoodToday = moodDate &&
        moodDate.getDate() === today.getDate() &&
        moodDate.getMonth() === today.getMonth() &&
        moodDate.getFullYear() === today.getFullYear();

      const hasAlert = isMoodToday && ['sad', 'anxious', 'frustrated'].includes(latestMood?.mood);

      return {
        id: p.id,
        userId: p.userId,
        name: p.name,
        latestMood: latestMood?.mood || null,
        latestMoodDate: latestMood?.recordedAt || null,
        hasAlert,
        photoCount,
        wellnessScore
      };
    }));

    res.json(patientData);
  } catch (err) {
    console.error('GET PATIENTS ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST Add Patient by Email ────────────────────────────────────────────────
router.post('/patients/add', authenticate, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const caregiver = await getCaregiverProfile(req.user.id);
    if (!caregiver) return res.status(404).json({ error: 'Caregiver profile not found.' });

    // Find user by email
    const patientUser = await db.User.findOne({ where: { email, role: 'patient' } });
    if (!patientUser) return res.status(404).json({ error: 'No patient found with this email.' });

    // Find patient profile
    const patient = await db.Patient.findOne({ where: { userId: patientUser.id } });
    if (!patient) return res.status(404).json({ error: 'Patient profile not found.' });

    // Check if already assigned
    const existing = await db.sequelize.query(
      `SELECT * FROM patient_caregiver_relationships WHERE patient_id = :patientId AND caregiver_id = :caregiverId`,
      { replacements: { patientId: patient.id, caregiverId: caregiver.id }, type: db.sequelize.QueryTypes.SELECT }
    );
    if (existing.length > 0) return res.status(400).json({ error: 'Patient is already assigned to you.' });

    // Create relationship
    await db.sequelize.query(
      `INSERT INTO patient_caregiver_relationships (patient_id, caregiver_id, created_at, updated_at) VALUES (:patientId, :caregiverId, NOW(), NOW())`,
      { replacements: { patientId: patient.id, caregiverId: caregiver.id } }
    );

    res.json({ message: 'Patient added successfully!', patient: { id: patient.id, name: patient.name } });
  } catch (err) {
    console.error('ADD PATIENT ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET Single Patient Details ───────────────────────────────────────────────
router.get('/patients/:patientId', authenticate, async (req, res) => {
  try {
    const caregiver = await getCaregiverProfile(req.user.id);
    if (!caregiver) return res.status(404).json({ error: 'Caregiver profile not found.' });

    const patient = await db.Patient.findByPk(req.params.patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found.' });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [moods, photos, appointments, careNotes] = await Promise.all([
      db.Mood.findAll({
        where: { patientId: patient.userId },
        order: [['recordedAt', 'DESC']],
        limit: 7
      }),
      db.Photo.findAll({
        where: { patientId: patient.userId },
        order: [['takenAt', 'DESC']],
        limit: 5
      }),
      db.Appointment.findAll({
        where: { patientId: patient.userId, caregiverId: caregiver.id },
        order: [['appointmentDate', 'ASC']]
      }),
      db.CareNote.findAll({
        where: { patientId: patient.userId, caregiverId: caregiver.id },
        order: [['createdAt', 'DESC']],
        limit: 10
      })
    ]);

    const wellnessScore = calculateWellnessScore(moods);
    const latestMood = moods[0] || null;
    const today = new Date();
    const moodDate = latestMood ? new Date(latestMood.recordedAt) : null;
    const isMoodToday = moodDate &&
      moodDate.getDate() === today.getDate() &&
      moodDate.getMonth() === today.getMonth() &&
      moodDate.getFullYear() === today.getFullYear();
    const hasAlert = isMoodToday && ['sad', 'anxious', 'frustrated'].includes(latestMood?.mood);

    res.json({ patient, moods, photos, appointments, careNotes, wellnessScore, hasAlert, latestMood });
  } catch (err) {
    console.error('GET PATIENT DETAILS ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── POST Add Appointment ─────────────────────────────────────────────────────
router.post('/patients/:patientId/appointments', authenticate, async (req, res) => {
  try {
    const caregiver = await getCaregiverProfile(req.user.id);
    if (!caregiver) return res.status(404).json({ error: 'Caregiver profile not found.' });

    const patient = await db.Patient.findByPk(req.params.patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found.' });

    const { title, doctorName, appointmentType, appointmentDate, notes } = req.body;
    if (!title || !appointmentDate) return res.status(400).json({ error: 'Title and date are required.' });

    const appointment = await db.Appointment.create({
      patientId: patient.userId,
      caregiverId: caregiver.id,
      title, doctorName, appointmentType, appointmentDate, notes
    });

    res.json(appointment);
  } catch (err) {
    console.error('ADD APPOINTMENT ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE Appointment ───────────────────────────────────────────────────────
router.delete('/appointments/:appointmentId', authenticate, async (req, res) => {
  try {
    await db.Appointment.destroy({ where: { id: req.params.appointmentId } });
    res.json({ message: 'Appointment deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST Add Care Note ───────────────────────────────────────────────────────
router.post('/patients/:patientId/notes', authenticate, async (req, res) => {
  try {
    const caregiver = await getCaregiverProfile(req.user.id);
    if (!caregiver) return res.status(404).json({ error: 'Caregiver profile not found.' });

    const patient = await db.Patient.findByPk(req.params.patientId);
    if (!patient) return res.status(404).json({ error: 'Patient not found.' });

    const { note } = req.body;
    if (!note) return res.status(400).json({ error: 'Note is required.' });

    const careNote = await db.CareNote.create({
      patientId: patient.userId,
      caregiverId: caregiver.id,
      note
    });

    res.json(careNote);
  } catch (err) {
    console.error('ADD NOTE ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE Care Note ─────────────────────────────────────────────────────────
router.delete('/notes/:noteId', authenticate, async (req, res) => {
  try {
    await db.CareNote.destroy({ where: { id: req.params.noteId } });
    res.json({ message: 'Note deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET Appointments for Patient Dashboard ───────────────────────────────────
router.get('/my-appointments', authenticate, async (req, res) => {
  try {
    const upcoming = await db.Appointment.findAll({
      where: {
        patientId: req.user.id,
        appointmentDate: { [Op.gte]: new Date() }
      },
      order: [['appointmentDate', 'ASC']],
      limit: 5
    });
    res.json(upcoming);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;