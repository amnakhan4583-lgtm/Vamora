'use strict';
const express = require('express');
const router = express.Router();
const { Mood } = require('../../models');
const { authenticate } = require('../middlewares/auth');

// Save a mood check-in
router.post('/', authenticate, async (req, res) => {
  try {
    const { mood, note } = req.body;
    if (!mood) return res.status(400).json({ error: 'Mood is required.' });

    const entry = await Mood.create({
      patientId: req.user.id,
      mood,
      note: note || '',
      recordedAt: new Date(),
    });

    res.json({ success: true, entry });
  } catch (err) {
    console.error('MOOD ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all mood check-ins for logged-in patient
router.get('/', authenticate, async (req, res) => {
  try {
    const moods = await Mood.findAll({
      where: { patientId: req.user.id },
      order: [['recordedAt', 'DESC']]
    });
    res.json(moods);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;