'use strict';
const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const db       = require('../../models');
const { authenticate, requireSuperAdmin } = require('../middlewares/auth');

const guard = [authenticate, requireSuperAdmin];

// ── Helpers ───────────────────────────────────────────────────────────────────

function generatePassword() {
  const adj  = ['Calm', 'Warm', 'Kind', 'Soft', 'Bright'];
  const noun = ['Rose', 'Lake', 'Star', 'Oak',  'Moon'];
  return `${adj[Math.floor(Math.random() * 5)]}${noun[Math.floor(Math.random() * 5)]}${Math.floor(100 + Math.random() * 900)}`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Resolves the display name from whichever profile the user has.
function resolveName(user) {
  return (
    user.patientProfile?.name  ||
    user.caregiverProfile?.name ||
    user.doctorProfile?.name   ||
    null
  );
}

const profileIncludes = [
  { model: db.Patient,   as: 'patientProfile',   attributes: ['name'] },
  { model: db.Caregiver, as: 'caregiverProfile',  attributes: ['name', 'isLocked'] },
  { model: db.Doctor,    as: 'doctorProfile',     attributes: ['name', 'isLocked'] }
];

// ══════════════════════════════════════════════════════════════════════════════
// POST /super-admin/doctors
// ══════════════════════════════════════════════════════════════════════════════
router.post('/doctors', ...guard, async (req, res) => {
  const { name, email, password, specialization, licenseNumber } = req.body;
  if (!name || !email) return res.status(400).json({ message: 'name and email are required.' });
  if (!isValidEmail(email)) return res.status(400).json({ message: 'Invalid email address.' });

  const exists = await db.User.findOne({ where: { email: email.trim().toLowerCase() } });
  if (exists) return res.status(409).json({ message: 'A user with this email already exists.' });

  const defaultPassword = password || generatePassword();
  const t = await db.sequelize.transaction();
  try {
    // User model beforeCreate hook hashes the password automatically.
    const user = await db.User.create(
      { email: email.trim().toLowerCase(), password: defaultPassword, role: 'doctor' },
      { transaction: t }
    );
    const doctor = await db.Doctor.create(
      { userId: user.id, name: name.trim(), specialization: specialization || null, licenseNumber: licenseNumber || null },
      { transaction: t }
    );
    await t.commit();
    res.status(201).json({
      message:         'Doctor created.',
      user:            { id: user.id, email: user.email, role: user.role },
      doctor:          { id: doctor.id, name: doctor.name, specialization: doctor.specialization },
      defaultPassword: password ? undefined : defaultPassword
    });
  } catch (err) {
    await t.rollback();
    console.error('CREATE DOCTOR ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /super-admin/caregivers
// ══════════════════════════════════════════════════════════════════════════════
router.post('/caregivers', ...guard, async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email) return res.status(400).json({ message: 'name and email are required.' });
  if (!isValidEmail(email)) return res.status(400).json({ message: 'Invalid email address.' });

  const exists = await db.User.findOne({ where: { email: email.trim().toLowerCase() } });
  if (exists) return res.status(409).json({ message: 'A user with this email already exists.' });

  const defaultPassword = password || generatePassword();
  const t = await db.sequelize.transaction();
  try {
    const user = await db.User.create(
      { email: email.trim().toLowerCase(), password: defaultPassword, role: 'caregiver' },
      { transaction: t }
    );
    const caregiver = await db.Caregiver.create(
      { userId: user.id, name: name.trim(), phone: phone || null },
      { transaction: t }
    );
    await t.commit();
    res.status(201).json({
      message:         'Caregiver created.',
      user:            { id: user.id, email: user.email, role: user.role },
      caregiver:       { id: caregiver.id, name: caregiver.name },
      defaultPassword: password ? undefined : defaultPassword
    });
  } catch (err) {
    await t.rollback();
    console.error('CREATE CAREGIVER ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// POST /super-admin/patients
// ══════════════════════════════════════════════════════════════════════════════
router.post('/patients', ...guard, async (req, res) => {
  const { name, email, password, dateOfBirth } = req.body;
  if (!name || !email) return res.status(400).json({ message: 'name and email are required.' });
  if (!isValidEmail(email)) return res.status(400).json({ message: 'Invalid email address.' });

  const exists = await db.User.findOne({ where: { email: email.trim().toLowerCase() } });
  if (exists) return res.status(409).json({ message: 'A user with this email already exists.' });

  const defaultPassword = password || generatePassword();
  const t = await db.sequelize.transaction();
  try {
    const user = await db.User.create(
      { email: email.trim().toLowerCase(), password: defaultPassword, role: 'patient' },
      { transaction: t }
    );
    const patient = await db.Patient.create(
      { userId: user.id, name: name.trim(), dateOfBirth: dateOfBirth || null },
      { transaction: t }
    );
    await t.commit();
    res.status(201).json({
      message:         'Patient created.',
      user:            { id: user.id, email: user.email, role: user.role },
      patient:         { id: patient.id, name: patient.name },
      defaultPassword: password ? undefined : defaultPassword
    });
  } catch (err) {
    await t.rollback();
    console.error('CREATE PATIENT ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /super-admin/users — all users with name resolved from profile
// ══════════════════════════════════════════════════════════════════════════════
router.get('/users', ...guard, async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: ['id', 'email', 'role', 'isActive', 'createdAt'],
      include: profileIncludes,
      order: [['createdAt', 'ASC']]
    });

    res.json(users.map(u => ({
      id:        u.id,
      email:     u.email,
      role:      u.role,
      isActive:  u.isActive,
      name:      resolveName(u),
      isLocked:  u.doctorProfile?.isLocked ?? u.caregiverProfile?.isLocked ?? null,
      createdAt: u.createdAt
    })));
  } catch (err) {
    console.error('LIST USERS ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// GET /super-admin/logs — last 50 registrations as an activity log
// ══════════════════════════════════════════════════════════════════════════════
router.get('/logs', ...guard, async (req, res) => {
  try {
    const entries = await db.User.findAll({
      attributes: ['id', 'email', 'role', 'isActive', 'createdAt'],
      include: profileIncludes,
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json(entries.map(u => ({
      id:        u.id,
      email:     u.email,
      role:      u.role,
      isActive:  u.isActive,
      name:      resolveName(u),
      createdAt: u.createdAt
    })));
  } catch (err) {
    console.error('LOGS ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// PATCH /super-admin/doctors/:id/lock — toggle isLocked on Doctor record
// :id is the User table primary key (users.id) — matches what GET /users returns
// ══════════════════════════════════════════════════════════════════════════════
router.patch('/doctors/:id/lock', ...guard, async (req, res) => {
  try {
    const doctor = await db.Doctor.findOne({ where: { userId: req.params.id } });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found.' });

    await doctor.update({ isLocked: !doctor.isLocked });

    res.json({
      message:  `Doctor ${doctor.isLocked ? 'locked' : 'unlocked'} successfully.`,
      doctorId: doctor.id,
      isLocked: doctor.isLocked
    });
  } catch (err) {
    console.error('LOCK DOCTOR ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// PATCH /super-admin/caregivers/:id/lock — toggle isLocked on Caregiver record
// :id is the User table primary key (users.id)
// ══════════════════════════════════════════════════════════════════════════════
router.patch('/caregivers/:id/lock', ...guard, async (req, res) => {
  try {
    const caregiver = await db.Caregiver.findOne({ where: { userId: req.params.id } });
    if (!caregiver) return res.status(404).json({ message: 'Caregiver not found.' });

    await caregiver.update({ isLocked: !caregiver.isLocked });

    res.json({
      message:  `Caregiver ${caregiver.isLocked ? 'locked' : 'unlocked'} successfully.`,
      isLocked: caregiver.isLocked
    });
  } catch (err) {
    console.error('LOCK CAREGIVER ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// DELETE /super-admin/users/:id — permanently remove a user account
// ══════════════════════════════════════════════════════════════════════════════
router.delete('/users/:id', ...guard, async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user.role === 'super_admin') {
      return res.status(403).json({ message: 'Cannot delete super admin account.' });
    }
    await user.destroy();
    res.json({ message: 'User deleted successfully.' });
  } catch (err) {
    console.error('DELETE USER ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
