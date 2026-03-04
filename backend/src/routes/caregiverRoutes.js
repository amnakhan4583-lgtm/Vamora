 'use strict';
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { authorize } = require('../middlewares/auth');
const { Photo, User } = require('../../models');

// Get all patients assigned to this caregiver
router.get('/patients', authenticate, authorize('caregiver'), async (req, res) => {
  try {
    const caregiver = await User.findByPk(req.user.id, {
      include: [{
        model: User,
        as: 'patients',
        attributes: ['id', 'name', 'email']
      }]
    });
    res.json({ patients: caregiver?.patients || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get photos of a specific patient
router.get('/patients/:patientId/photos', authenticate, authorize('caregiver'), async (req, res) => {
  try {
    const photos = await Photo.findAll({
      where: { patientId: req.params.patientId },
      order: [['takenAt', 'DESC']]
    });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
