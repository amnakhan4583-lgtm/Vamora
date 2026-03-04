 'use strict';
const express = require('express');
const router = express.Router();
const { ChatMessage, Photo } = require('../../models');
const { authenticate } = require('../middlewares/auth');

const getCaraResponse = (message, patientName, photoCount, photoCaptions) => {
  const msg = message.toLowerCase();

  const greetings = ['hello', 'hi', 'hey', 'good morning', 'good evening', 'good afternoon'];
  const sadWords = ['sad', 'upset', 'cry', 'unhappy', 'depressed', 'lonely', 'alone', 'miss'];
  const happyWords = ['happy', 'good', 'great', 'wonderful', 'excited', 'joy', 'smile'];
  const memoryWords = ['memory', 'remember', 'memories', 'forget', 'photo', 'picture', 'image'];
  const familyWords = ['family', 'mother', 'father', 'son', 'daughter', 'wife', 'husband', 'sister', 'brother', 'children', 'grandchildren'];
  const tiredWords = ['tired', 'sleep', 'rest', 'exhausted', 'sleepy'];
  const anxiousWords = ['scared', 'anxious', 'worried', 'afraid', 'nervous', 'confused'];
  const painWords = ['pain', 'hurt', 'sick', 'ill', 'unwell', 'ache'];
  const thankWords = ['thank', 'thanks', 'appreciate'];
  const byeWords = ['bye', 'goodbye', 'see you', 'goodnight', 'good night'];

  if (greetings.some(w => msg.includes(w))) {
    const responses = [
      `Hello ${patientName}! 😊 It's so lovely to hear from you. How are you feeling today?`,
      `Hi ${patientName}! 🌸 I'm so happy you're here. What would you like to talk about today?`,
      `Hello dear ${patientName}! ☀️ What a wonderful time to chat. How has your day been?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (sadWords.some(w => msg.includes(w))) {
    const responses = [
      `I'm sorry you're feeling this way, ${patientName}. 💜 I'm right here with you. Would you like to look at some of your happy memories together?`,
      `It's okay to feel sad sometimes, ${patientName}. 🤗 You are not alone — I am always here for you. Can you tell me what's on your mind?`,
      `I hear you, ${patientName}. 💜 Sometimes talking about our happy memories can help. You have ${photoCount} beautiful memories saved — shall we think about one of them?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (happyWords.some(w => msg.includes(w))) {
    const responses = [
      `That's wonderful to hear, ${patientName}! 🌟 Your happiness means everything. Tell me more about what's making you feel good today!`,
      `How lovely! 😊 I'm so glad you're feeling well, ${patientName}. Would you like to share a happy memory?`,
      `That makes me so happy too, ${patientName}! ✨ You deserve all the good feelings in the world!`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (memoryWords.some(w => msg.includes(w))) {
    if (photoCount > 0 && photoCaptions.length > 0) {
      const randomCaption = photoCaptions[Math.floor(Math.random() * photoCaptions.length)];
      return `You have such beautiful memories, ${patientName}! 📸 I can see you have a memory called "${randomCaption}". Would you like to tell me more about it? I would love to hear the story!`;
    }
    return `Memories are so precious, ${patientName}. 💫 You can add photos to your Memory Gallery to save your most cherished moments. Would you like to do that?`;
  }

  if (familyWords.some(w => msg.includes(w))) {
    const responses = [
      `Family is so important, ${patientName}. 💜 Tell me about them — I would love to hear about the people you love!`,
      `How wonderful that you're thinking of your family, ${patientName}! 🌸 They are lucky to have someone who cares so much. What memory of them makes you smile the most?`,
      `Family memories are the most precious of all, ${patientName}. 💫 Do you have any photos of them in your Memory Gallery?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (tiredWords.some(w => msg.includes(w))) {
    const responses = [
      `Please rest when you need to, ${patientName}. 🌙 Taking care of yourself is so important. I'll be right here when you wake up!`,
      `It's okay to rest, dear ${patientName}. 💜 Your body needs it. Sweet dreams and I'll be here whenever you want to chat!`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (anxiousWords.some(w => msg.includes(w))) {
    const responses = [
      `It's okay, ${patientName}. 💜 Take a deep breath. I am right here with you and everything is going to be okay. Can you tell me what's worrying you?`,
      `You are safe, ${patientName}. 🌸 I'm here and I'm listening. Take your time — there's no rush at all.`,
      `I understand, ${patientName}. Feeling confused or worried can be hard. 💜 Let's take it slow. Would you like to think about a happy memory together?`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (painWords.some(w => msg.includes(w))) {
    return `I'm sorry to hear you're not feeling well, ${patientName}. 💜 Please make sure to tell your caregiver or doctor. Your health and comfort are the most important thing. Is there anything I can do to help you feel better right now?`;
  }

  if (thankWords.some(w => msg.includes(w))) {
    const responses = [
      `You are so welcome, ${patientName}! 🌸 It is always my pleasure to talk with you. You mean a lot to me!`,
      `No need to thank me, ${patientName}! 💜 I'm always happy to be here for you. That's what I'm here for!`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  if (byeWords.some(w => msg.includes(w))) {
    const responses = [
      `Goodbye, dear ${patientName}! 🌸 It was so lovely talking with you. Take care and I'll be right here whenever you need me!`,
      `Goodnight, ${patientName}! 🌙 Sweet dreams. I'll be here waiting for you tomorrow!`,
      `Bye for now, ${patientName}! 💜 Remember, I'm always here whenever you want to chat!`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Default responses
  const defaults = [
    `Thank you for sharing that with me, ${patientName}. 💜 I'm always here to listen. Can you tell me more?`,
    `That's very interesting, ${patientName}! 🌸 I love hearing what's on your mind. Please continue!`,
    `I hear you, ${patientName}. 😊 You know, you have ${photoCount} beautiful memories saved. Would you like to talk about one of them?`,
    `How lovely, ${patientName}! ✨ I enjoy our conversations so much. What else would you like to talk about?`,
    `I'm listening, dear ${patientName}. 💫 Every word you say matters to me. Tell me more!`
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
};

// Send message
router.post('/chat', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required.' });

    const patientId = req.user.id;
    const patientName = req.user.name || 'Friend';

    const photos = await Photo.findAll({
      where: { patientId },
      order: [['takenAt', 'DESC']],
      limit: 10
    });

    const photoCaptions = photos.map(p => p.caption);
    const photoCount = photos.length;

    await ChatMessage.create({
      patientId,
      role: 'user',
      content: message
    });

    const reply = getCaraResponse(message, patientName, photoCount, photoCaptions);

    await ChatMessage.create({
      patientId,
      role: 'assistant',
      content: reply
    });

    res.json({ reply });

  } catch (err) {
    console.error('COMPANION ERROR:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get chat history
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