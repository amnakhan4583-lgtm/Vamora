 'use strict';
const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { Photo } = require('../../models');
const { authenticate } = require('../middlewares/auth'); // ✅ correct name

// Upload photo
router.post('/', authenticate, upload.single('photo'), async (req, res) => {
  try {
    if (!req.body.caption || req.body.caption.trim() === '') {
      return res.status(400).json({ error: 'Caption is required.' });
    }
    const photo = await Photo.create({
      patientId:    req.user.id,
       filename: `/uploads/photos/${req.file.filename}`.replace(/\\/g, '/'),
      originalName: req.file.originalname,
      caption:      req.body.caption.trim(),
      takenAt:      req.body.takenAt || new Date(),
    });
    res.json({ success: true, photo });
 } catch (err) {
    console.error('UPLOAD ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});
// Get all photosnode
// Get all photos
router.get('/', authenticate, async (req, res) => {
  try {
    const photos = await Photo.findAll({
      where: { patientId: req.user.id },
      order: [['takenAt', 'DESC']]
    });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add optional voice note to a photo
router.post('/:id/voice', authenticate, upload.single('voice'), async (req, res) => {
  try {
    const photo = await Photo.findOne({ 
      where: { id: req.params.id, patientId: req.user.id } 
    });
    if (!photo) return res.status(404).json({ error: 'Photo not found.' });
    await photo.update({ voiceNoteUrl: `/uploads/photos/${req.file.filename}` });
    res.json({ success: true, voiceNoteUrl: photo.voiceNoteUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a photo
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await Photo.destroy({ where: { id: req.params.id, patientId: req.user.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;