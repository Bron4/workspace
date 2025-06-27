const express = require('express');
const City = require('../models/City');
const { requireUser } = require('./middleware/auth');

const router = express.Router();

// GET /api/admin/cities - Get all cities for admin management
router.get('/cities', requireUser, async (req, res) => {
  try {
    console.log('Admin: Fetching all cities for management');

    const cities = await City.find({})
      .select('_id name googleReviewLink isActive createdAt')
      .sort({ name: 1 });

    console.log(`Admin: Found ${cities.length} cities`);
    console.log('Admin: Cities data:', cities.map(city => ({ id: city._id, name: city.name, googleReviewLink: city.googleReviewLink })));

    res.json({
      cities: cities.map(city => ({
        id: city._id,
        name: city.name,
        googleReviewLink: city.googleReviewLink,
        isActive: city.isActive,
        createdAt: city.createdAt
      }))
    });
  } catch (error) {
    console.error('Admin: Error fetching cities:', error);
    res.status(500).json({
      error: 'Failed to fetch cities'
    });
  }
});

// POST /api/admin/cities - Create a new city
router.post('/cities', requireUser, async (req, res) => {
  try {
    const { name, googleReviewLink } = req.body;

    console.log('Admin: Creating new city with data:', { name, googleReviewLink });
    console.log('Admin: Request body received:', req.body);

    // Validation
    if (!name || !googleReviewLink) {
      console.log('Admin: Validation failed - missing required fields');
      return res.status(400).json({
        error: 'City name and Google review link are required'
      });
    }

    // Check if city already exists
    const existingCity = await City.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingCity) {
      console.log('Admin: City creation failed - duplicate name:', name);
      return res.status(400).json({
        error: 'A city with this name already exists'
      });
    }

    // Create new city
    const newCity = new City({
      name: name.trim(),
      googleReviewLink: googleReviewLink.trim(),
      isActive: true
    });

    const savedCity = await newCity.save();
    console.log('Admin: City created successfully with ID:', savedCity._id);
    console.log('Admin: Saved city data:', { id: savedCity._id, name: savedCity.name, googleReviewLink: savedCity.googleReviewLink });

    res.status(201).json({
      success: true,
      message: 'City created successfully',
      city: {
        id: savedCity._id,
        name: savedCity.name,
        googleReviewLink: savedCity.googleReviewLink,
        isActive: savedCity.isActive,
        createdAt: savedCity.createdAt
      }
    });
  } catch (error) {
    console.error('Admin: Error creating city:', error);
    console.error('Admin: Error stack:', error.stack);
    if (error.code === 11000) {
      res.status(400).json({
        error: 'A city with this name already exists'
      });
    } else {
      res.status(500).json({
        error: 'Failed to create city'
      });
    }
  }
});

// PUT /api/admin/cities/:id - Update city name and/or Google review link
router.put('/cities/:id', requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, googleReviewLink } = req.body;

    console.log('Admin: Updating city with ID:', id);
    console.log('Admin: Update data received:', { name, googleReviewLink });
    console.log('Admin: Full request body:', req.body);

    // Validation - at least one field must be provided
    if (!name && !googleReviewLink) {
      console.log('Admin: Update validation failed - no fields provided');
      return res.status(400).json({
        error: 'At least one field (name or googleReviewLink) is required'
      });
    }

    // If name is being updated, check for duplicates
    if (name) {
      console.log('Admin: Checking for duplicate city name:', name);
      const existingCity = await City.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${name}$`, 'i') }
      });

      if (existingCity) {
        console.log('Admin: Update failed - duplicate city name found:', existingCity.name);
        return res.status(400).json({
          error: 'A city with this name already exists'
        });
      }
    }

    // Build update object
    const updateData = {};
    if (name) {
      updateData.name = name.trim();
      console.log('Admin: Will update name to:', updateData.name);
    }
    if (googleReviewLink) {
      updateData.googleReviewLink = googleReviewLink.trim();
      console.log('Admin: Will update googleReviewLink to:', updateData.googleReviewLink);
    }

    console.log('Admin: Final update data:', updateData);

    // Find and update city
    const updatedCity = await City.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedCity) {
      console.log('Admin: Update failed - city not found with ID:', id);
      return res.status(404).json({
        error: 'City not found'
      });
    }

    console.log('Admin: City updated successfully with ID:', updatedCity._id);
    console.log('Admin: Updated city data:', { id: updatedCity._id, name: updatedCity.name, googleReviewLink: updatedCity.googleReviewLink });

    res.json({
      success: true,
      message: 'City configuration updated successfully',
      city: {
        id: updatedCity._id,
        name: updatedCity.name,
        googleReviewLink: updatedCity.googleReviewLink,
        isActive: updatedCity.isActive,
        createdAt: updatedCity.createdAt
      }
    });
  } catch (error) {
    console.error('Admin: Error updating city:', error);
    console.error('Admin: Error stack:', error.stack);
    if (error.code === 11000) {
      res.status(400).json({
        error: 'A city with this name already exists'
      });
    } else {
      res.status(500).json({
        error: 'Failed to update city'
      });
    }
  }
});

// DELETE /api/admin/cities/:id - Delete a city
router.delete('/cities/:id', requireUser, async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Admin: Deleting city with ID:', id);

    // Find and delete city
    const deletedCity = await City.findByIdAndDelete(id);

    if (!deletedCity) {
      console.log('Admin: Delete failed - city not found with ID:', id);
      return res.status(404).json({
        error: 'City not found'
      });
    }

    console.log('Admin: City deleted successfully:', deletedCity.name);

    res.json({
      success: true,
      message: `City "${deletedCity.name}" deleted successfully`
    });
  } catch (error) {
    console.error('Admin: Error deleting city:', error);
    console.error('Admin: Error stack:', error.stack);
    res.status(500).json({
      error: 'Failed to delete city'
    });
  }
});

module.exports = router;