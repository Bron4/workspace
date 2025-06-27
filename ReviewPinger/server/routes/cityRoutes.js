const express = require('express');
const City = require('../models/City');
const { requireUser } = require('./middleware/auth');

const router = express.Router();

// GET /api/cities - Get all cities
router.get('/', requireUser, async (req, res) => {
  try {
    console.log('Fetching all cities');
    
    const cities = await City.find({ isActive: true })
      .select('_id name googleReviewLink')
      .sort({ name: 1 });

    console.log(`Found ${cities.length} cities`);

    res.json({
      cities: cities.map(city => ({
        id: city._id,
        name: city.name,
        googleReviewLink: city.googleReviewLink
      }))
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({
      error: 'Failed to fetch cities'
    });
  }
});

module.exports = router;