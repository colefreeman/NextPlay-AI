// routes/profile.js
const express = require('express');
const router = express.Router();
const { driver } = require('../src/config/neo4j-driver');
const cloudinary = require('../src/config/cloudinary');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Save profile
router.post('/', async (req, res) => {
  const { userId, ...profileData } = req.body;
  const session = driver.session();
  
  try {
    // Remove the datetime field from profileData to handle it separately
    const { updatedAt, ...cleanProfileData } = profileData;

    const result = await session.run(
      `
      MATCH (u:User {id: $userId})
      SET u += $profileData,
          u.updatedAt = date()
      RETURN u {.*} as user
      `,
      {
        userId,
        profileData: cleanProfileData // Use the cleaned data without datetime
      }
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

// Add profile picture upload route
router.post('/upload-photo', upload.single('profilePicture'), async (req, res) => {
  const session = driver.session();
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      folder: 'profile_pictures',
    });

    // Save URL to Neo4j
    const result = await session.run(
      `
      MATCH (u:User {id: $userId})
      SET u.profilePicture = $profilePicture
      RETURN u {.*} as user
      `,
      {
        userId: req.body.userId,
        profilePicture: uploadResponse.secure_url
      }
    );

    const updatedProfile = result.records[0]?.get('user');
    res.json(updatedProfile);
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  } finally {
    await session.close();
  }
});

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

module.exports = router;