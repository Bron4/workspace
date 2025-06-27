const express = require('express');
const Technician = require('../models/Technician');
const City = require('../models/City');
const { requireUser } = require('./middleware/auth');

const router = express.Router();

// GET /api/technicians - Get all technicians
router.get('/', async (req, res) => {
  try {
    console.log('Fetching all technicians');

    const technicians = await Technician.find({ isActive: true })
      .populate('cityId', 'name')
      .sort({ name: 1 });

    console.log(`Found ${technicians.length} technicians`);
    console.log('Technician IDs returned:', technicians.map(t => ({ id: t._id.toString(), name: t.name, isActive: t.isActive })));

    const formattedTechnicians = technicians.map(tech => ({
      id: tech._id,
      name: tech.name,
      email: tech.email,
      phone: tech.phone,
      cityId: tech.cityId?._id || null,
      cityName: tech.cityId?.name || 'Unknown City'
    }));

    res.json({ technicians: formattedTechnicians });
  } catch (error) {
    console.error('Error fetching technicians:', error);
    res.status(500).json({ error: 'Failed to fetch technicians' });
  }
});

// POST /api/technicians - Create new technician
router.post('/', requireUser, async (req, res) => {
  try {
    const { name, email, phone, cityId } = req.body;

    console.log('Creating new technician:', { name, email, phone, cityId });

    // Validate required fields
    if (!name || !email || !phone || !cityId) {
      return res.status(400).json({
        error: 'All fields are required: name, email, phone, cityId'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Check if city exists
    const city = await City.findById(cityId);
    if (!city) {
      return res.status(400).json({
        error: 'Invalid city selected'
      });
    }

    // Check if email already exists
    const existingTechnician = await Technician.findOne({ email: email.toLowerCase() });
    if (existingTechnician) {
      return res.status(400).json({
        error: 'A technician with this email already exists'
      });
    }

    // Create new technician
    const technician = new Technician({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      cityId,
      isActive: true
    });

    await technician.save();
    await technician.populate('cityId', 'name');

    console.log('Technician created successfully:', technician._id);

    res.status(201).json({
      message: 'Technician created successfully',
      technician: {
        id: technician._id,
        name: technician.name,
        email: technician.email,
        phone: technician.phone,
        cityId: technician.cityId._id,
        cityName: technician.cityId.name
      }
    });
  } catch (error) {
    console.error('Error creating technician:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: `Validation error: ${validationErrors.join(', ')}`
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'A technician with this email already exists'
      });
    }

    res.status(500).json({
      error: 'Failed to create technician'
    });
  }
});

// DELETE /api/technicians/:id - Delete technician
router.delete('/:id', requireUser, async (req, res) => {
  try {
    const { id } = req.params;

    console.log('Deleting technician:', id);

    // Validate ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid technician ID format'
      });
    }

    // Find and delete the technician
    const technician = await Technician.findById(id);
    if (!technician) {
      return res.status(404).json({
        error: 'Technician not found'
      });
    }

    // Soft delete by setting isActive to false
    technician.isActive = false;
    await technician.save();

    console.log('Technician deleted successfully:', id);

    res.json({
      message: 'Technician deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting technician:', error);
    res.status(500).json({
      error: 'Failed to delete technician'
    });
  }
});

module.exports = router;