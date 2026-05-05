'use strict';
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const db = require('../../models');
const { authenticate, authorize } = require('../middlewares/auth');

const doctorOnly = [authenticate, authorize('doctor')];

// ── Helpers ───────────────────────────────────────────────────────────────────
function generateDefaultPassword() {
  const adj  = ['Calm','Warm','Kind','Soft','Bright'];
  const noun = ['Rose','Lake','Star','Oak','Moon'];
  return `${adj[Math.floor(Math.random()*5)]}${noun[Math.floor(Math.random()*5)]}${Math.floor(100+Math.random()*900)}`;
}

const MOOD_SCORES = { happy:10, excited:10, calm:8, tired:5, confused:4, anxious:3, frustrated:3, sad:2 };

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

const MOOD_EMOJI = { happy:'😊', calm:'😌', sad:'😔', anxious:'😰', frustrated:'😡', tired:'😴', excited:'🤩', confused:'😕' };

// ══════════════════════════════════════════════════════════════════════════════
// GET /doctor/patients  — all patients + mood, wellness, MMSE, caregiver
// ══════════════════════════════════════════════════════════════════════════════
router.get('/patients', ...doctorOnly, async (req, res) => {
  try {
    const patients = await db.Patient.findAll({
      include: [
        { model: db.User, as: 'user', attributes: ['email'] },
        {
          model: db.Caregiver, as: 'caregivers',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ],
      order: [['name', 'ASC']]
    });

    const result = await Promise.all(patients.map(async (p) => {
      const [moods, latestMmse] = await Promise.all([
        db.Mood.findAll({ where: { patientId: p.userId }, order: [['recordedAt','DESC']], limit: 7 }),
        db.MmseScore.findOne({ where: { patientId: p.userId }, order: [['assessmentDate','DESC']] })
      ]);

      const wellnessScore = calcWellness(moods);
      const latestMood    = moods[0] || null;

      const today    = new Date();
      const moodDate = latestMood ? new Date(latestMood.recordedAt) : null;
      const isMoodToday = moodDate &&
        moodDate.getDate()     === today.getDate() &&
        moodDate.getMonth()    === today.getMonth() &&
        moodDate.getFullYear() === today.getFullYear();
      const hasAlert = isMoodToday && wellnessScore !== null && wellnessScore < 4;

      const assignedCaregiver = p.caregivers && p.caregivers.length > 0 ? p.caregivers[0] : null;

      return {
        id: p.id,
        userId: p.userId,
        name: p.name,
        diagnosisType: p.diagnosisType,
        email: p.user?.email || '',
        latestMood: latestMood?.mood || null,
        latestMoodEmoji: latestMood ? (MOOD_EMOJI[latestMood.mood] || '😐') : null,
        wellnessScore,
        latestMmseScore: latestMmse?.score ?? null,
        cognitiveStatus: cognitiveStatus(latestMmse?.score ?? null),
        assignedCaregiver: assignedCaregiver ? { id: assignedCaregiver.id, name: assignedCaregiver.name } : null,
        hasAlert
      };
    }));

    res.json({ status: 'success', data: result });
  } catch (err) {
    console.error('GET PATIENTS ERROR:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /doctor/patients/:id — full patient details
// ══════════════════════════════════════════════════════════════════════════════
router.get('/patients/:id', ...doctorOnly, async (req, res) => {
  try {
    const patient = await db.Patient.findByPk(req.params.id, {
      include: [
        { model: db.User, as: 'user', attributes: ['email'] },
        {
          model: db.Caregiver, as: 'caregivers',
          attributes: ['id', 'name', 'phone'],
          through: { attributes: [] }
        }
      ]
    });
    if (!patient) return res.status(404).json({ status: 'error', message: 'Patient not found.' });

    const [moods, appointments, medications, mmseScores, careNotes, photoCount] = await Promise.all([
      db.Mood.findAll({ where: { patientId: patient.userId }, order: [['recordedAt','DESC']], limit: 10 }),
      db.Appointment.findAll({ where: { patientId: patient.userId }, order: [['appointmentDate','ASC']] }),
      db.Medication.findAll({ where: { patientId: patient.userId }, order: [['createdAt','DESC']] }),
      db.MmseScore.findAll({ where: { patientId: patient.userId }, order: [['assessmentDate','ASC']] }),
      db.CareNote.findAll({ where: { patientId: patient.userId }, order: [['createdAt','DESC']], limit: 20 }),
      db.Photo.count({ where: { patientId: patient.userId } })
    ]);

    const wellnessScore = calcWellness(moods.slice(0, 7));
    const latestMood    = moods[0] || null;
    const latestMmse    = mmseScores.length > 0 ? mmseScores[mmseScores.length - 1] : null;
    const assignedCaregiver = patient.caregivers && patient.caregivers.length > 0 ? patient.caregivers[0] : null;

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
        assignedCaregiver,
        moods,
        appointments,
        medications,
        mmseScores,
        careNotes,
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
// DELETE /doctor/patients/:id — delete patient + all related data
// ══════════════════════════════════════════════════════════════════════════════
router.delete('/patients/:id', ...doctorOnly, async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const patient = await db.Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ status: 'error', message: 'Patient not found.' });

    const uid = patient.userId;

    await db.Photo.destroy({ where: { patientId: uid }, transaction });
    await db.Mood.destroy({ where: { patientId: uid }, transaction });
    await db.ChatMessage.destroy({ where: { patientId: uid }, transaction });
    await db.Appointment.destroy({ where: { patientId: uid }, transaction });
    await db.Medication.destroy({ where: { patientId: uid }, transaction });
    await db.MmseScore.destroy({ where: { patientId: uid }, transaction });
    await db.CareNote.destroy({ where: { patientId: uid }, transaction });
    await db.sequelize.query(
      'DELETE FROM patient_caregiver_relationships WHERE patient_id = :pid',
      { replacements: { pid: patient.id }, transaction }
    );
    await patient.destroy({ transaction });
    await db.User.destroy({ where: { id: uid }, transaction });

    await transaction.commit();
    res.json({ status: 'success', message: 'Patient deleted.' });
  } catch (err) {
    await transaction.rollback();
    console.error('DELETE PATIENT ERROR:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /doctor/caregivers — ALL caregivers in system
// ══════════════════════════════════════════════════════════════════════════════
router.get('/caregivers', ...doctorOnly, async (req, res) => {
  try {
    const caregivers = await db.Caregiver.findAll({
      include: [
        { model: db.User, as: 'user', attributes: ['email'] },
        {
          model: db.Patient, as: 'patients',
          attributes: ['id', 'name', 'userId'],
          through: { attributes: [] }
        }
      ],
      order: [['name', 'ASC']]
    });

    const result = await Promise.all(caregivers.map(async (cg) => {
      // last activity = most recent care note for any of their patients
      const patientUserIds = (cg.patients || []).map(p => p.userId);
      let lastActivityDate = null;
      if (patientUserIds.length > 0) {
        const lastNote = await db.CareNote.findOne({
          where: { caregiverId: cg.id },
          order: [['createdAt', 'DESC']]
        });
        lastActivityDate = lastNote?.createdAt || null;
      }

      return {
        id: cg.id,
        name: cg.name || 'Unknown',
        email: cg.user?.email || '',
        phone: cg.phone || null,
        patientCount: (cg.patients || []).length,
        patientNames: (cg.patients || []).map(p => p.name),
        lastActivityDate
      };
    }));

    res.json({ status: 'success', data: result });
  } catch (err) {
    console.error('GET CAREGIVERS ERROR:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// APPOINTMENTS
// ══════════════════════════════════════════════════════════════════════════════
router.post('/patients/:id/appointments', ...doctorOnly, async (req, res) => {
  try {
    const patient = await db.Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ status: 'error', message: 'Patient not found.' });

    const { title, doctorName, appointmentType, appointmentDate, notes } = req.body;
    if (!title || !appointmentDate)
      return res.status(400).json({ status: 'error', message: 'Title and date are required.' });

    const appt = await db.Appointment.create({
      patientId: patient.userId,
      doctorId: req.user.id,
      title, doctorName, appointmentType, appointmentDate, notes
    });
    res.status(201).json({ status: 'success', data: appt });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

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
router.post('/patients/:id/medications', ...doctorOnly, async (req, res) => {
  try {
    const patient = await db.Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ status: 'error', message: 'Patient not found.' });

    const { medicationName, dosage, frequency, timing, startDate, endDate, notes } = req.body;
    if (!medicationName)
      return res.status(400).json({ status: 'error', message: 'Medication name is required.' });

    const med = await db.Medication.create({
      patientId: patient.userId,
      doctorId: req.user.id,
      medicationName, dosage, frequency, timing,
      startDate: startDate || null, endDate: endDate || null, notes
    });
    res.status(201).json({ status: 'success', data: med });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

router.get('/patients/:id/medications', ...doctorOnly, async (req, res) => {
  try {
    const patient = await db.Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ status: 'error', message: 'Patient not found.' });
    const meds = await db.Medication.findAll({ where: { patientId: patient.userId }, order: [['createdAt','DESC']] });
    res.json({ status: 'success', data: meds });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

router.delete('/medications/:id', ...doctorOnly, async (req, res) => {
  try {
    await db.Medication.destroy({ where: { id: req.params.id } });
    res.json({ status: 'success', message: 'Medication deleted.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// MMSE
// ══════════════════════════════════════════════════════════════════════════════
router.post('/patients/:id/mmse', ...doctorOnly, async (req, res) => {
  try {
    const patient = await db.Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ status: 'error', message: 'Patient not found.' });

    const { score, assessmentDate, notes } = req.body;
    if (score === undefined || score === null || !assessmentDate)
      return res.status(400).json({ status: 'error', message: 'Score and assessment date are required.' });
    const s = parseInt(score);
    if (isNaN(s) || s < 0 || s > 30)
      return res.status(400).json({ status: 'error', message: 'Score must be 0–30.' });

    const entry = await db.MmseScore.create({
      patientId: patient.userId,
      doctorId: req.user.id,
      score: s, assessmentDate, notes
    });
    res.status(201).json({ status: 'success', data: entry });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

router.get('/patients/:id/mmse', ...doctorOnly, async (req, res) => {
  try {
    const patient = await db.Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ status: 'error', message: 'Patient not found.' });
    const scores = await db.MmseScore.findAll({ where: { patientId: patient.userId }, order: [['assessmentDate','ASC']] });
    res.json({ status: 'success', data: scores });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /doctor/my-medications — patient's own medications (patient token)
// ══════════════════════════════════════════════════════════════════════════════
router.get('/my-medications', authenticate, async (req, res) => {
  try {
    const meds = await db.Medication.findAll({
      where: { patientId: req.user.id },
      order: [['createdAt','DESC']]
    });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// TEAM MANAGEMENT (create patient, link caregiver, assign)
// ══════════════════════════════════════════════════════════════════════════════
router.post('/team/patients', ...doctorOnly, async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ status: 'error', message: 'Name and email are required.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ status: 'error', message: 'Enter a valid email address.' });
  const existing = await db.User.findOne({ where: { email } });
  if (existing) return res.status(409).json({ status: 'error', message: 'An account with this email already exists.' });

  const defaultPassword = generateDefaultPassword();
  const t = await db.sequelize.transaction();
  try {
    const user    = await db.User.create({ email: email.trim().toLowerCase(), password: defaultPassword, role: 'patient' }, { transaction: t });
    const patient = await db.Patient.create({ userId: user.id, name: name.trim(), createdByDoctorId: req.user.id }, { transaction: t });
    await t.commit();
    res.status(201).json({ status: 'success', data: { id: patient.id, name: patient.name, email: user.email, createdAt: patient.createdAt, defaultPassword } });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ status: 'error', message: err.message });
  }
});

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
    res.json({ status: 'success', message: 'Caregiver linked.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
