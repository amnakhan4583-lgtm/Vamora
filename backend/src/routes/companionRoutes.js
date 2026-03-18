'use strict';
const express = require('express');
const router = express.Router();
const { ChatMessage, Photo, Mood } = require('../../models');
const db = require('../../models');
const { authenticate } = require('../middlewares/auth');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Build Patient Context for LLM ───────────────────────────────────────────
const buildPatientContext = (patientName, photos, moods, recentChats) => {
  let context = `You are Cara, a warm and caring AI companion for an Alzheimer's patient named ${patientName}. `;
  context += `You speak gently, warmly, and with lots of love and patience. Always use the patient's name. `;
  context += `Never say you are an AI model or mention Groq or any technology. You are simply Cara, their companion.\n\n`;

  if (photos.length > 0) {
    context += `${patientName}'s saved memories (photos):\n`;
    photos.forEach((p, i) => {
      const date = new Date(p.takenAt).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      });
      context += `${i + 1}. "${p.caption}" — uploaded on ${date}\n`;
    });
    context += '\n';
  } else {
    context += `${patientName} has not uploaded any memories yet.\n\n`;
  }

  if (moods.length > 0) {
    context += `${patientName}'s recent mood check-ins:\n`;
    moods.forEach(m => {
      const date = new Date(m.recordedAt).toLocaleDateString('en-US', {
        weekday: 'long', month: 'short', day: 'numeric'
      });
      context += `- Felt ${m.mood} on ${date}${m.note ? ` — note: "${m.note}"` : ''}\n`;
    });
    context += '\n';
  }

  if (recentChats.length > 0) {
    context += `Recent conversation history:\n`;
    recentChats.forEach(m => {
      const role = m.role === 'user' ? patientName : 'Cara';
      context += `${role}: ${m.content}\n`;
    });
    context += '\n';
  }

  context += `Important rules:\n`;
  context += `1. Always be warm, gentle, and patient\n`;
  context += `2. Keep responses short and simple — maximum 3 sentences\n`;
  context += `3. Always end with a gentle question or encouragement\n`;
  context += `4. If patient seems sad or anxious, console them with love\n`;
  context += `5. Reference their actual memories and moods when relevant\n`;
  context += `6. Never give medical advice — always suggest speaking to their caregiver or doctor\n`;
  context += `7. Use emojis occasionally to keep the tone warm 💜\n`;

  return context;
};

// ─── Main Chat Route ──────────────────────────────────────────────────────────
router.post('/chat', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required.' });

    const patientId = req.user.id;

    const patientProfile = await db.Patient.findOne({ where: { userId: patientId } });
    const patientName = patientProfile?.name?.split(' ')[0] || req.user.email?.split('@')[0] || 'Friend';

    const [photos, moods, recentChats] = await Promise.all([
      Photo.findAll({ where: { patientId }, order: [['takenAt', 'DESC']], limit: 20 }),
      Mood.findAll({ where: { patientId }, order: [['recordedAt', 'DESC']], limit: 10 }),
      ChatMessage.findAll({ where: { patientId }, order: [['createdAt', 'DESC']], limit: 10 })
    ]);

    const systemContext = buildPatientContext(patientName, photos, moods, recentChats.reverse());

    await ChatMessage.create({ patientId, role: 'user', content: message });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemContext },
        { role: 'user', content: message }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    const reply = completion.choices[0]?.message?.content?.trim() ||
      `I'm here for you, ${patientName}. 💜 Would you like to talk about one of your memories?`;

    await ChatMessage.create({ patientId, role: 'assistant', content: reply });

    res.json({ reply });

  } catch (err) {
    console.error('COMPANION ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── Chat History Route ───────────────────────────────────────────────────────
router.get('/history', authenticate, async (req, res) => {
  try {
    const messages = await ChatMessage.findAll({
      where: { patientId: req.user.id },
      order: [['createdAt', 'ASC']],
      limit: 50
    });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;