// backend/routes/profile.js
const express = require('express');
const router = express.Router();
const { driver } = require('../src/config/neo4j-driver');

// Fetch profile
router.get('/:userId', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `
      MATCH (u:User {id: $userId})
      RETURN u {.*} as user
      `,
      { userId: req.params.userId }
    );
    
    const profile = result.records[0]?.get('user') || null;
    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  } finally {
    await session.close();
  }
});

// Save profile
router.post('/', async (req, res) => {
  const session = driver.session();
  const { userId, ...profileData } = req.body;
  
  try {
    const result = await session.run(
      `
      MATCH (u:User {id: $userId})
      SET u += $profileData
      RETURN u {.*} as user
      `,
      { userId, profileData }
    );
    
    const updatedProfile = result.records[0]?.get('user');
    res.json(updatedProfile);
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ error: 'Failed to save profile' });
  } finally {
    await session.close();
  }
});

module.exports = router;