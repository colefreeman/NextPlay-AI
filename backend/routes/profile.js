// NextPlay-AI/backend/routes/profile.js
const express = require('express');
const router = express.Router();
const { db } = require('../config/db');

// Save profile
router.post('/', async (req, res) => {
  const { userId, ...profileData } = req.body;
  const timestamp = '2025-01-19 19:46:02';
  
  try {
    await db.collection('profiles').updateOne(
      { userId },
      { 
        $set: {
          ...profileData,
          username: 'colefreeman',
          createdAt: timestamp
        }
      },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

// Fetch profile
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const profile = await db.collection('profiles').findOne({ userId });
    res.json(profile || null);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;