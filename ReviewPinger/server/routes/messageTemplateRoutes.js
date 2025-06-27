const express = require('express');
const MessageTemplate = require('../models/MessageTemplate');
const { requireUser } = require('./middleware/auth');

const router = express.Router();

// GET /api/admin/message-template - Get the active message template
router.get('/message-template', requireUser, async (req, res) => {
  try {
    console.log('Admin: Fetching message template');

    // Find the default/active template
    let template = await MessageTemplate.findOne({ isDefault: true, isActive: true });
    
    // If no default template exists, get the first active one
    if (!template) {
      template = await MessageTemplate.findOne({ isActive: true }).sort({ createdAt: 1 });
    }

    // If still no template, create a default one
    if (!template) {
      console.log('Admin: No template found, creating default template');
      template = new MessageTemplate({
        name: 'Default Template',
        template: 'Thank you {customerName} for choosing Bates Electric\nWould you please elevate my performance for you today?\n{googleReviewLink}\n\nThank you,\n{technicianName}',
        isDefault: true,
        isActive: true
      });
      await template.save();
    }

    console.log('Admin: Message template retrieved:', template.name);

    res.json({
      template: template.template
    });
  } catch (error) {
    console.error('Admin: Error fetching message template:', error);
    res.status(500).json({
      error: 'Failed to fetch message template'
    });
  }
});

// PUT /api/admin/message-template - Update the message template
router.put('/message-template', requireUser, async (req, res) => {
  try {
    const { template } = req.body;

    console.log('Admin: Updating message template');

    // Validation
    if (!template) {
      return res.status(400).json({
        error: 'Template content is required'
      });
    }

    // Find the default template or create one
    let messageTemplate = await MessageTemplate.findOne({ isDefault: true, isActive: true });
    
    if (messageTemplate) {
      // Update existing template
      messageTemplate.template = template.trim();
      messageTemplate.updatedAt = Date.now();
      await messageTemplate.save();
    } else {
      // Create new default template
      messageTemplate = new MessageTemplate({
        name: 'Default Template',
        template: template.trim(),
        isDefault: true,
        isActive: true
      });
      await messageTemplate.save();
    }

    console.log('Admin: Message template updated successfully');

    res.json({
      success: true,
      message: 'Message template updated successfully'
    });
  } catch (error) {
    console.error('Admin: Error updating message template:', error);
    res.status(500).json({
      error: 'Failed to update message template'
    });
  }
});

module.exports = router;