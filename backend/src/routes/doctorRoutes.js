'use strict';
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const db = require('../../models');
const { authenticate, authorize } = require('../middlewares/auth');

const doctorOnly = [authenticate, authorize('doctor')];

// ── Helpers ───────────────────────────────────────────────────────────────────
function generateDefaultPassword() {
  const adj = ['Calm', 'Warm', 'Kind', 'Soft', 'Bright'];
  const noun = ['Rose', 'Lake', 'Star', 'Oak', 'Moon'];
  return `${adj[Math.floor(Math.random() * 5)]}${noun[Math.floor(Math.random() * 5)]}${Math.floor(100 + Math.random() * 900)}`;
}

const MOOD_SCORES = { happy: 10, excited: 10, calm: 8, tired: 5, confused: 4, anxious: 3, frustrated: 3, sad: 2 };

function calcWellness(moods) {
  if (!moods || moods.length === 0) return null;
  const total = moods.reduce((s, m) => s + (MOOD_SCORES[m.mood] || 5), 0);
  return Math.round(total / moods.length);
}

function cognitiveStatus(score) {
  if (score === null || score === undefined) return null;
  if (score >= 24) return 'Stable';
  if (score >= 18) return 'Needs Monitoring';
  return 'Declining';
}

const MOOD_EMOJI = { happy: '😊', calm: '😌', sad: '😔', anxious: '😰', frustrated: '😡', tired: '😴', excited: '🤩', confused: '😕' };

// ══════════════════════════════════════════════════════════════════════════════
// PATIENT OVERVIEW & DETAILS
// ══════════════════════════════════════════════════════════════════════════════

// GET /doctor/patients — all patients with mood, wellness, MMSE
router.get('/patients', ...doctorOnly, async (req, res) => {
  try {
    const patients = await db.Patient.findAll({
      include: [{ model: db.User, as: 'user', attributes: ['email'] }],
      order: [['name', 'ASC']]
    });

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const result = await Promise.all(patients.map(async (p) => {
      const [moods, latestMmse, photoCount] = await Promise.all([
        db.Mood.findAll({ where: { patientId: p.userId }, order: [['recordedAt', 'DESC']], limit: 7 }),
        db.MmseScore.findOne({ where: { patientId: p.userId }, order: [['assessmentDate', 'DESC']] }),
        db.Photo.count({ where: { patientId: p.userId } })
      ]);

      const wellnessScore = calcWellness(moods);
      const latestMood = moods[0] || null;

      const today = new Date();
      const moodDate = latestMood ? new Date(latestMood.recordedAt) : null;
      const isMoodToday = moodDate &&
        moodDate.getDate() === today.getDate() &&
        moodDate.getMonth() === today.getMonth() &&
        moodDate.getFullYear() === today.getFullYear();
      const hasAlert = isMoodToday && wellnessScore !== null && wellnessScore < 4;

      return {
        id: p.id,
        userId: p.userId,
        name: p.name,
        diagnosisType: p.diagnosisType,
        diagnosisDate: p.diagnosisDate,
        email: p.user?.email || '',
        latestMood: latestMood?.mood || null,
        latestMoodEmoji: latestMood ? (MOOD_EMOJI[latestMood.mood] || '😐') : null,
        latestMoodDate: latestMood?.recordedAt || null,
        wellnessScore,
        latestMmseScore: latestMmse?.score ?? null,
        latestMmseDate: latestMmse?.assessmentDate || null,
        cognitiveStatus: cognitiveStatus(latestMmse?.score ?? null),
        photoCount,
        hasAlert
      };
    }));

    res.json({ status: 'success', data: result });
  } catch (err) {
    console.error('GET ALL PATIENTS ERROR:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /doctor/patients/:patientId — full patient details
router.get('/patients/:patientId', ...doctorOnly, async (req, res) => {
  try {
    const patient = await db.Patient.findByPk(req.params.patientId, {
      include: [{ model: db.User, as: 'user', attributes: ['email'] }]
    });
    if (!patient) return res.status(404).json({ status: 'error', message: 'Patient not found.' });

    const [moods, appointments, medications, mmseScores, photoCount] = await Promise.all([
      db.Mood.findAll({ where: { patientId: patient.userId }, order: [['recordedAt', 'DESC']], limit: 10 }),
      db.Appointment.findAll({ where: { patientId: patient.userId }, order: [['appointmentDate', 'ASC']] }),
      db.Medication.findAll({ where: { patientId: patient.userId }, order: [['createdAt', 'DESC']] }),
      db.MmseScore.findAll({ where: { patientId: patient.userId }, order: [['assessmentDate', 'ASC']] }),
      db.Photo.count({ where: { patientId: patient.userId } })
    ]);

    const wellnessScore = calcWellness(moods.slice(0, 7));
    const latestMood = moods[0] || null;
    const latestMmse = mmseScores.length > 0 ? mmseScores[mmseScores.length - 1] : null;

    res.json({
      status: 'success',
      data: {
        patient: {
          id: patient.id,
          userId: patient.userId,
          name: patient.name,
          email: patient.user?.email || '',
          diagnosisType: patient.diagnosisType,
          diagnosisDate: patient.diagnosisDate,
          dateOfBirth: patient.dateOfBirth
        },
        moods,
        appointments,
        medications,
        mmseScores,
        photoCount,
        wellnessScore,
        latestMood,
        latestMmseScore: latestMmse?.score ?? null,
        cognitiveStatus: cognitiveStatus(latestMmse?.score ?? null)
      }
    });
  } catch (err) {
    console.error('GET PATIENT DETAIL ERROR:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// APPOINTMENTS
// ══════════════════════════════════════════════════════════════════════════════

// POST /doctor/patients/:patientId/appointments
router.post('/patients/:patientId/appointments', ...doctorOnly, async (req, res) => {
  try {
    const patient = await db.Patient.findByPk(req.params.patientId);
    if (!patient) return res.status(404).json({ status: 'error', message: 'Patient not found.' });

    const { title, doctorName, appointmentType, appointmentDate, notes } = req.body;
    if (!title || !appointmentDate) {
      return res.status(400).json({ status: 'error', message: 'Title and appointment date are required.' });
    }

    const appt = await db.Appointment.create({
      patientId: patient.userId,
      doctorId: req.user.id,
      title, doctorName, appointmentType, appointmentDate, notes
    });

    res.status(201).json({ status: 'success', data: appt });
  } catch (err) {
    console.error('ADD APPOINTMENT ERROR:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// DELETE /doctor/appointments/:id
router.delete('/appointments/:id', ...doctorOnly, async (req, res) => {
  try {
    await db.Appointment.destroy({ where: { id: req.params.id } });
    res.json({ status: 'success', message: 'Appointment deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// MEDICATIONS
// ══════════════════════════════════════════════════════════════════════════════

// POST /doctor/patients/:patientId/medications
router.post('/patients/:patientId/medications', ...doctorOnly, async (req, res) => {
  try {
    const patient = await db.Patient.findByPk(req.params.patientId);
    if (!patient) return res.status(404).json({ status: 'error', message: 'Patient not found.' });

    const { medicationName, dosage, frequency, timing, startDate, endDate, notes } = req.body;
    if (!medicationName) {
      return res.status(400).json({ status: 'error', message: 'Medication name is required.' });
    }

    const med = await db.Medication.create({
      patientId: patient.userId,
      doctorId: req.user.id,
      medicationName, dosage, frequency, timing, startDate: startDate || null, endDate: endDate || null, notes
    });

    res.status(201).json({ status: 'success', data: med });
  } catch (err) {
    console.error('ADD MEDICATION ERROR:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /doctor/patients/:patientId/medications
router.get('/patients/:patientId/medications', ...doctorOnly, async (req, res) => {
  try {
    const patient = await db.Patient.findByPk(req.params.patientId);
    if (!patient) return res.status(404).json({ status: 'error', message: 'Patient not found.' });

    const meds = await db.Medication.findAll({
      where: { patientId: patient.userId },
      order: [['createdAt', 'DESC']]
    });
    res.json({ status: 'success', data: meds });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// DELETE /doctor/medications/:id
router.delete('/medications/:id', ...doctorOnly, async (req, res) => {
  try {
    await db.Medication.destroy({ where: { id: req.params.id } });
    res.json({ status: 'success', message: 'Medication deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// MMSE SCORES
// ══════════════════════════════════════════════════════════════════════════════

// POST /doctor/patients/:patientId/mmse
router.post('/patients/:patientId/mmse', ...doctorOnly, async (req, res) => {
  try {
    const patient = await db.Patient.findByPk(req.params.patientId);
    if (!patient) return res.status(404).json({ status: 'error', message: 'Patient not found.' });

    const { score, assessmentDate, notes } = req.body;
    if (score === undefined || score === null || !assessmentDate) {
      return res.status(400).json({ status: 'error', message: 'Score and assessment date are required.' });
    }
    if (score < 0 || score > 30) {
      return res.status(400).json({ status: 'error', message: 'MMSE score must be between 0 and 30.' });
    }

    const entry = await db.MmseScore.create({
      patientId: patient.userId,
      doctorId: req.user.id,
      score: parseInt(score),
      assessmentDate,
      notes
    });

    res.status(201).json({ status: 'success', data: entry });
  } catch (err) {
    console.error('ADD MMSE ERROR:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /doctor/patients/:patientId/mmse
router.get('/patients/:patientId/mmse', ...doctorOnly, async (req, res) => {
  try {
    const patient = await db.Patient.findByPk(req.params.patientId);
    if (!patient) return res.status(404).json({ status: 'error', message: 'Patient not found.' });

    const scores = await db.MmseScore.findAll({
      where: { patientId: patient.userId },
      order: [['assessmentDate', 'ASC']]
    });
    res.json({ status: 'success', data: scores });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// PATIENT-FACING: my medications (authenticated as patient)
// ══════════════════════════════════════════════════════════════════════════════

// GET /doctor/my-medications — called by patient dashboard using patient token
router.get('/my-medications', authenticate, async (req, res) => {
  try {
    const meds = await db.Medication.findAll({
      where: { patientId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// TEAM MANAGEMENT (patient creation, caregiver linking, assignment)
// ══════════════════════════════════════════════════════════════════════════════

// POST /doctor/team/patients — create a patient account
router.post('/team/patients', ...doctorOnly, async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ status: 'error', message: 'Name and email are required.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ status: 'error', message: 'Enter a valid email address.' });

  const existing = await db.User.findOne({ where: { email } });
  if (existing) return res.status(409).json({ status: 'error', message: 'An account with this email already exists.' });

  const defaultPassword = generateDefaultPassword();
  const transaction = await db.sequelize.transaction();
  try {
    const user = await db.User.create({ email: email.trim().toLowerCase(), password: defaultPassword, role: 'patient' }, { transaction });
    const patient = await db.Patient.create({ userId: user.id, name: name.trim(), createdByDoctorId: req.user.id }, { transaction });
    await transaction.commit();
    res.status(201).json({ status: 'success', data: { id: patient.id, name: patient.name, email: user.email, createdAt: patient.createdAt, defaultPassword } });
  } catch (err) {
    await transaction.rollback();
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// GET /doctor/team/caregivers — caregivers linked to this doctor
router.get('/team/caregivers', ...doctorOnly, async (req, res) => {
  try {
    const caregivers = await db.Caregiver.findAll({
      where: { doctorId: req.user.id },
      include: [
        { model: db.User, as: 'user', attributes: ['email'] },
        { model: db.Patient, as: 'patients', attributes: ['id', 'name'], through: { attributes: [] } }
      ],
      order: [['createdAt', 'ASC']]
    });
    const result = caregivers.map(cg => ({
      id: cg.id, name: cg.name, email: cg.user?.email || '',
      specialization: cg.specialization || 'Caregiver', joinedAt: cg.createdAt,
      assignedPatients: (cg.patients || []).map(p => ({ id: p.id, name: p.name })),
      patientCount: (cg.patients || []).length
    }));
    res.json({ status: 'success', data: result });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /doctor/team/caregivers/link
router.post('/team/caregivers/link', ...doctorOnly, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ status: 'error', message: 'Caregiver email is required.' });
  try {
    const cgUser = await db.User.findOne({ where: { email: email.trim().toLowerCase(), role: 'caregiver' } });
    if (!cgUser) return res.status(404).json({ status: 'error', message: 'No caregiver found with this email.' });
    const caregiver = await db.Caregiver.findOne({ where: { userId: cgUser.id } });
    if (!caregiver) return res.status(404).json({ status: 'error', message: 'Caregiver profile not found.' });
    if (caregiver.doctorId && caregiver.doctorId !== req.user.id)
      return res.status(409).json({ status: 'error', message: 'Caregiver is already linked to another doctor.' });
    await caregiver.update({ doctorId: req.user.id });
    res.json({ status: 'success', data: { id: caregiver.id, name: caregiver.name, email: cgUser.email, specialization: caregiver.specialization || 'Caregiver', joinedAt: caregiver.createdAt, assignedPatients: [], patientCount: 0 } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// POST /doctor/team/patients/:patientId/assign
router.post('/team/patients/:patientId/assign', ...doctorOnly, async (req, res) => {
  const { caregiverId } = req.body;
  if (!caregiverId) return res.status(400).json({ status: 'error', message: 'caregiverId is required.' });
  try {
    const patient = await db.Patient.findByPk(req.params.patientId);
    if (!patient) return res.status(404).json({ status: 'error', message: 'Patient not found.' });
    const caregiver = await db.Caregiver.findOne({ where: { id: caregiverId, doctorId: req.user.id } });
    if (!caregiver) return res.status(404).json({ status: 'error', message: 'Caregiver not linked to you.' });
    const existing = await db.sequelize.query(
      `SELECT 1 FROM patient_caregiver_relationships WHERE patient_id = :pid AND caregiver_id = :cid`,
      { replacements: { pid: patient.id, cid: caregiver.id }, type: db.sequelize.QueryTypes.SELECT }
    );
    if (existing.length === 0) {
      await db.sequelize.query(
        `INSERT INTO patient_caregiver_relationships (patient_id, caregiver_id, created_at, updated_at) VALUES (:pid, :cid, NOW(), NOW())`,
        { replacements: { pid: patient.id, cid: caregiver.id } }
      );
    }
    res.json({ status: 'success', message: 'Patient assigned to caregiver.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// DELETE /doctor/team/patients/:patientId/assign/:caregiverId
router.delete('/team/patients/:patientId/assign/:caregiverId', ...doctorOnly, async (req, res) => {
  try {
    const patient = await db.Patient.findByPk(req.params.patientId);
    if (!patient) return res.status(404).json({ status: 'error', message: 'Patient not found.' });
    await db.sequelize.query(
      `DELETE FROM patient_caregiver_relationships WHERE patient_id = :pid AND caregiver_id = :cid`,
      { replacements: { pid: patient.id, cid: Number(req.params.caregiverId) } }
    );
    res.json({ status: 'success', message: 'Assignment removed.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
