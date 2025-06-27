const express = require('express');
const MessageTemplate = require('../models/MessageTemplate');
const { requireUser } = require('./middleware/auth');

const router = express.Router();

// GET /api/sms-templates - Get all SMS message templates
router.get('/', requireUser, async (req, res) => {
  try {
    console.log('SMS Templates: Fetching all templates');

    const templates = await MessageTemplate.find({ isActive: true })
      .sort({ createdAt: -1 })
      .select('_id name template isDefault createdAt updatedAt');

    console.log(`SMS Templates: Retrieved ${templates.length} templates`);

    res.json({
      templates: templates.map(template => ({
        id: template._id,
        name: template.name,
        content: template.template,
        isDefault: template.isDefault,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt
      }))
    });
  } catch (error) {
    console.error('SMS Templates: Error fetching templates:', error);
    res.status(500).json({
      error: 'Failed to fetch SMS templates'
    });
  }
});

// GET /api/sms-templates/:id - Get specific SMS message template by ID
router.get('/:id', requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`SMS Templates: Fetching template with ID: ${id}`);

    const template = await MessageTemplate.findById(id);

    if (!template || !template.isActive) {
      console.log(`SMS Templates: Template not found with ID: ${id}`);
      return res.status(404).json({
        error: 'SMS template not found'
      });
    }

    console.log(`SMS Templates: Retrieved template: ${template.name}`);

    res.json({
      template: {
        id: template._id,
        name: template.name,
        content: template.template,
        isDefault: template.isDefault,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt
      }
    });
  } catch (error) {
    console.error(`SMS Templates: Error fetching template with ID ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Failed to fetch SMS template'
    });
  }
});

// POST /api/sms-templates - Create new SMS message template
router.post('/', requireUser, async (req, res) => {
  try {
    const { name, content, description, isDefault } = req.body;
    console.log('SMS Templates: Creating new template:', { name, isDefault });

    // Validation
    if (!name || !content) {
      return res.status(400).json({
        error: 'Template name and content are required'
      });
    }

    // Check if template name already exists
    const existingTemplate = await MessageTemplate.findOne({ 
      name: name.trim(), 
      isActive: true 
    });

    if (existingTemplate) {
      return res.status(400).json({
        error: 'A template with this name already exists'
      });
    }

    // If this is being set as default, unset other defaults
    if (isDefault) {
      await MessageTemplate.updateMany(
        { isDefault: true },
        { isDefault: false }
      );
      console.log('SMS Templates: Unset previous default templates');
    }

    const template = new MessageTemplate({
      name: name.trim(),
      template: content.trim(),
      description: description?.trim(),
      isDefault: Boolean(isDefault),
      isActive: true
    });

    await template.save();
    console.log(`SMS Templates: Created new template with ID: ${template._id}`);

    res.status(201).json({
      success: true,
      message: 'SMS template created successfully',
      template: {
        id: template._id,
        name: template.name,
        content: template.template,
        description: template.description,
        isDefault: template.isDefault,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt
      }
    });
  } catch (error) {
    console.error('SMS Templates: Error creating template:', error);
    res.status(500).json({
      error: 'Failed to create SMS template'
    });
  }
});

// PUT /api/sms-templates/:id - Update SMS message template
router.put('/:id', requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, content, description, isDefault } = req.body;
    console.log(`SMS Templates: Updating template with ID: ${id}`);

    // Validation
    if (!name || !content) {
      return res.status(400).json({
        error: 'Template name and content are required'
      });
    }

    const template = await MessageTemplate.findById(id);

    if (!template || !template.isActive) {
      console.log(`SMS Templates: Template not found with ID: ${id}`);
      return res.status(404).json({
        error: 'SMS template not found'
      });
    }

    // Check if template name already exists (excluding current template)
    const existingTemplate = await MessageTemplate.findOne({ 
      name: name.trim(), 
      isActive: true,
      _id: { $ne: id }
    });

    if (existingTemplate) {
      return res.status(400).json({
        error: 'A template with this name already exists'
      });
    }

    // If this is being set as default, unset other defaults
    if (isDefault && !template.isDefault) {
      await MessageTemplate.updateMany(
        { isDefault: true, _id: { $ne: id } },
        { isDefault: false }
      );
      console.log('SMS Templates: Unset previous default templates');
    }

    // Update template
    template.name = name.trim();
    template.template = content.trim();
    template.description = description?.trim();
    template.isDefault = Boolean(isDefault);
    template.updatedAt = Date.now();

    await template.save();
    console.log(`SMS Templates: Updated template: ${template.name}`);

    res.json({
      success: true,
      message: 'SMS template updated successfully',
      template: {
        id: template._id,
        name: template.name,
        content: template.template,
        description: template.description,
        isDefault: template.isDefault,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt
      }
    });
  } catch (error) {
    console.error(`SMS Templates: Error updating template with ID ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Failed to update SMS template'
    });
  }
});

// DELETE /api/sms-templates/:id - Delete SMS message template
router.delete('/:id', requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`SMS Templates: Deleting template with ID: ${id}`);

    const template = await MessageTemplate.findById(id);

    if (!template || !template.isActive) {
      console.log(`SMS Templates: Template not found with ID: ${id}`);
      return res.status(404).json({
        error: 'SMS template not found'
      });
    }

    // Soft delete - set isActive to false
    template.isActive = false;
    template.updatedAt = Date.now();
    await template.save();

    console.log(`SMS Templates: Soft deleted template: ${template.name}`);

    res.json({
      success: true,
      message: 'SMS template deleted successfully'
    });
  } catch (error) {
    console.error(`SMS Templates: Error deleting template with ID ${req.params.id}:`, error);
    res.status(500).json({
      error: 'Failed to delete SMS template'
    });
  }
});

module.exports = router;