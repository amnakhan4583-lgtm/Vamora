'use strict';
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../../models');
const { authenticate, authorize } = require('../middlewares/auth');

const doctorOnly = [authenticate, authorize('doctor')];

// ── Generate a memorable default password ─────────────────────────────────────
function generateDefaultPassword() {
  const adjectives = ['Calm', 'Warm', 'Kind', 'Soft', 'Bright'];
  const nouns = ['Rose', 'Lake', 'Star', 'Oak', 'Moon'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${adj}${noun}${num}`;
}

// ── POST /doctor/patients — create a patient account ─────────────────────────
router.post('/patients', ...doctorOnly, async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ status: 'error', message: 'Name and email are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ status: 'error', message: 'Enter a valid email address.' });
  }

  const existing = await db.User.findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({ status: 'error', message: 'An account with this email already exists.' });
  }

  const defaultPassword = generateDefaultPassword();
  const transaction = await db.sequelize.transaction();

  try {
    const user = await db.User.create({
      email: email.trim().toLowerCase(),
      password: defaultPassword,
      role: 'patient'
    }, { transaction });

    const patient = await db.Patient.create({
      userId: user.id,
      name: name.trim(),
      createdByDoctorId: req.user.id
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      status: 'success',
      data: {
        id: patient.id,
        name: patient.name,
        email: user.email,
        createdAt: patient.createdAt,
        assignedCaregivers: [],
        defaultPassword
      }
    });
  } catch (err) {
    await transaction.rollback();
    console.error('CREATE PATIENT ERROR:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ── GET /doctor/patients — list patients created by this doctor ───────────────
router.get('/patients', ...doctorOnly, async (req, res) => {
  try {
    const patients = await db.Patient.findAll({
      where: { createdByDoctorId: req.user.id },
      include: [
        { model: db.User, as: 'user', attributes: ['email'] },
        {
          model: db.Caregiver,
          as: 'caregivers',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const result = patients.map(p => ({
      id: p.id,
      name: p.name,
      email: p.user?.email || '',
      createdAt: p.createdAt,
      assignedCaregivers: (p.caregivers || []).map(cg => ({ id: cg.id, name: cg.name }))
    }));

    res.json({ status: 'success', data: result });
  } catch (err) {
    console.error('GET PATIENTS ERROR:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ── GET /doctor/caregivers — list caregivers linked to this doctor ────────────
router.get('/caregivers', ...doctorOnly, async (req, res) => {
  try {
    const caregivers = await db.Caregiver.findAll({
      where: { doctorId: req.user.id },
      include: [
        { model: db.User, as: 'user', attributes: ['email'] },
        {
          model: db.Patient,
          as: 'patients',
          attributes: ['id', 'name'],
          include: [{ model: db.User, as: 'user', attributes: ['email'] }],
          through: { attributes: [] }
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    const result = caregivers.map(cg => ({
      id: cg.id,
      name: cg.name,
      email: cg.user?.email || '',
      specialization: cg.specialization || 'Caregiver',
      joinedAt: cg.createdAt,
      assignedPatients: (cg.patients || []).map(p => ({
        id: p.id,
        name: p.name,
        email: p.user?.email || ''
      })),
      patientCount: (cg.patients || []).length
    }));

    res.json({ status: 'success', data: result });
  } catch (err) {
    console.error('GET CAREGIVERS ERROR:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ── POST /doctor/caregivers/link — link a caregiver by email ─────────────────
router.post('/caregivers/link', ...doctorOnly, async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ status: 'error', message: 'Caregiver email is required.' });
  }

  try {
    const cgUser = await db.User.findOne({ where: { email: email.trim().toLowerCase(), role: 'caregiver' } });
    if (!cgUser) {
      return res.status(404).json({ status: 'error', message: 'No caregiver account found with this email.' });
    }

    const caregiver = await db.Caregiver.findOne({ where: { userId: cgUser.id } });
    if (!caregiver) {
      return res.status(404).json({ status: 'error', message: 'Caregiver profile not found.' });
    }

    if (caregiver.doctorId && caregiver.doctorId !== req.user.id) {
      return res.status(409).json({ status: 'error', message: 'This caregiver is already linked to another doctor.' });
    }

    await caregiver.update({ doctorId: req.user.id });

    res.json({
      status: 'success',
      data: {
        id: caregiver.id,
        name: caregiver.name,
        email: cgUser.email,
        specialization: caregiver.specialization || 'Caregiver',
        joinedAt: caregiver.createdAt,
        assignedPatients: [],
        patientCount: 0
      }
    });
  } catch (err) {
    console.error('LINK CAREGIVER ERROR:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ── POST /doctor/patients/:patientId/assign — assign caregiver to patient ─────
router.post('/patients/:patientId/assign', ...doctorOnly, async (req, res) => {
  const { caregiverId } = req.body;
  if (!caregiverId) {
    return res.status(400).json({ status: 'error', message: 'caregiverId is required.' });
  }

  try {
    const patient = await db.Patient.findOne({
      where: { id: req.params.patientId, createdByDoctorId: req.user.id }
    });
    if (!patient) {
      return res.status(404).json({ status: 'error', message: 'Patient not found or not yours.' });
    }

    const caregiver = await db.Caregiver.findOne({
      where: { id: caregiverId, doctorId: req.user.id }
    });
    if (!caregiver) {
      return res.status(404).json({ status: 'error', message: 'Caregiver not found or not linked to you.' });
    }

    const existing = await db.sequelize.query(
      `SELECT 1 FROM patient_caregiver_relationships WHERE patient_id = :pid AND caregiver_id = :cid`,
      { replacements: { pid: patient.id, cid: caregiver.id }, type: db.sequelize.QueryTypes.SELECT }
    );

    if (existing.length === 0) {
      await db.sequelize.query(
        `INSERT INTO patient_caregiver_relationships (patient_id, caregiver_id, created_at, updated_at)
         VALUES (:pid, :cid, NOW(), NOW())`,
        { replacements: { pid: patient.id, cid: caregiver.id } }
      );
    }

    res.json({ status: 'success', message: 'Patient assigned to caregiver.' });
  } catch (err) {
    console.error('ASSIGN ERROR:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ── DELETE /doctor/patients/:patientId/assign/:caregiverId — unassign ─────────
router.delete('/patients/:patientId/assign/:caregiverId', ...doctorOnly, async (req, res) => {
  try {
    const patient = await db.Patient.findOne({
      where: { id: req.params.patientId, createdByDoctorId: req.user.id }
    });
    if (!patient) {
      return res.status(404).json({ status: 'error', message: 'Patient not found or not yours.' });
    }

    await db.sequelize.query(
      `DELETE FROM patient_caregiver_relationships
       WHERE patient_id = :pid AND caregiver_id = :cid`,
      { replacements: { pid: patient.id, cid: Number(req.params.caregiverId) } }
    );

    res.json({ status: 'success', message: 'Assignment removed.' });
  } catch (err) {
    console.error('UNASSIGN ERROR:', err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
});

module.exports = router;
