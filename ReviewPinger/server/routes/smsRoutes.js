const express = require('express');
const SmsMessage = require('../models/SmsMessage');
const City = require('../models/City');
const Technician = require('../models/Technician');
const MessageTemplate = require('../models/MessageTemplate');
const simpleTextingService = require('../services/simpleTextingService');
const bitlyService = require('../services/bitlyService');
const { requireUser } = require('./middleware/auth');

const router = express.Router();

// POST /api/sms/send - Send SMS review request
router.post('/send', requireUser, async (req, res) => {
  try {
    const { cityId, technicianId, customerName, customerPhone } = req.body;
    console.log('SMS Send: Received request:', { cityId, technicianId, customerName, customerPhone: `***-***-${customerPhone?.slice(-4)}` });

    // Validation
    if (!cityId || !technicianId || !customerName || !customerPhone) {
      return res.status(400).json({
        error: 'All fields are required: cityId, technicianId, customerName, customerPhone'
      });
    }

    // Validate phone number format
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    if (!phoneRegex.test(customerPhone)) {
      return res.status(400).json({
        error: 'Invalid phone number format. Please use XXX-XXX-XXXX format'
      });
    }

    // Get city information
    const city = await City.findById(cityId);
    if (!city || !city.isActive) {
      console.log(`SMS Send: City not found with ID: ${cityId}`);
      return res.status(404).json({
        error: 'City not found or inactive'
      });
    }

    // Get technician information
    const technician = await Technician.findById(technicianId);
    console.log(`SMS Send: Querying for technician ID: ${technicianId}`);
    console.log(`SMS Send: Technician found:`, technician ? { id: technician._id, name: technician.name, isActive: technician.isActive } : 'null');
    
    if (!technician || !technician.isActive) {
      console.log(`SMS Send: Technician not found with ID: ${technicianId}`);
      return res.status(404).json({
        error: 'Technician not found or inactive'
      });
    }

    // Get default message template
    const template = await MessageTemplate.findOne({ isDefault: true, isActive: true });
    if (!template) {
      console.log('SMS Send: No default message template found');
      return res.status(500).json({
        error: 'No default message template configured'
      });
    }

    console.log(`SMS Send: Found city: ${city.name}, technician: ${technician.name}`);

    // Shorten the Google review URL
    let reviewUrl = city.googleReviewLink;
    const shortenResult = await bitlyService.shortenUrl(city.googleReviewLink);
    
    if (shortenResult.success) {
      reviewUrl = shortenResult.shortUrl;
      console.log(`SMS Send: URL shortened from ${city.googleReviewLink} to ${reviewUrl}`);
    } else {
      console.log(`SMS Send: URL shortening failed, using original URL: ${shortenResult.error}`);
    }

    // Generate message content
    const messageContent = template.template
      .replace(/{customerName}/g, customerName)
      .replace(/{cityName}/g, city.name)
      .replace(/{googleReviewLink}/g, reviewUrl)
      .replace(/{technicianName}/g, technician.name);

    console.log(`SMS Send: Generated message content (${messageContent.length} chars)`);

    // Create SMS message record
    const smsMessage = new SmsMessage({
      cityId,
      technicianId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      messageContent,
      originalUrl: city.googleReviewLink,
      shortenedUrl: shortenResult.success ? shortenResult.shortUrl : null,
      status: 'pending'
    });

    await smsMessage.save();
    console.log(`SMS Send: Created SMS message record with ID: ${smsMessage._id}`);

    // Send SMS via SimpleTexting
    const sendResult = await simpleTextingService.sendSMS(customerPhone, messageContent);

    if (sendResult.success) {
      // Update message record with success
      smsMessage.status = 'sent';
      smsMessage.externalMessageId = sendResult.messageId;
      smsMessage.sentAt = new Date();
      await smsMessage.save();

      console.log(`SMS Send: SMS sent successfully to ${customerPhone}`);

      res.json({
        success: true,
        message: `Review request sent successfully to ${customerName} at ${customerPhone}`,
        messageId: smsMessage._id,
        externalMessageId: sendResult.messageId
      });
    } else {
      // Update message record with failure
      smsMessage.status = 'failed';
      smsMessage.errorMessage = sendResult.error;
      await smsMessage.save();

      console.log(`SMS Send: SMS sending failed: ${sendResult.error}`);

      res.status(500).json({
        error: sendResult.error || 'Failed to send SMS'
      });
    }

  } catch (error) {
    console.error('SMS Send: Error processing request:', error);
    res.status(500).json({
      error: 'Failed to send SMS request'
    });
  }
});

// GET /api/sms/history - Get SMS message history
router.get('/history', requireUser, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    console.log(`SMS History: Fetching page ${page}, limit ${limit}`);

    const messages = await SmsMessage.find()
      .populate('cityId', 'name')
      .populate('technicianId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await SmsMessage.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);

    console.log(`SMS History: Retrieved ${messages.length} messages, total: ${totalCount}`);

    const formattedMessages = messages.map(message => ({
      id: message._id,
      cityName: message.cityId?.name || 'Unknown City',
      technicianName: message.technicianId?.name || 'Unknown Technician',
      customerName: message.customerName,
      customerPhone: message.customerPhone.replace(/(\d{3})-(\d{3})-(\d{4})/, 'XXX-XXX-$3'),
      status: message.status.charAt(0).toUpperCase() + message.status.slice(1),
      sentAt: message.sentAt || message.createdAt
    }));

    res.json({
      messages: formattedMessages,
      total: totalCount, // Changed from totalCount to total to match frontend expectation
      totalCount, // Keep both for backward compatibility
      currentPage: page,
      totalPages
    });

  } catch (error) {
    console.error('SMS History: Error fetching message history:', error);
    res.status(500).json({
      error: 'Failed to fetch message history'
    });
  }
});

// GET /api/sms/status/:messageId - Get message status
router.get('/status/:messageId', requireUser, async (req, res) => {
  try {
    const { messageId } = req.params;
    console.log(`SMS Status: Checking status for message ${messageId}`);

    const message = await SmsMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        error: 'Message not found'
      });
    }

    // If we have an external message ID, check with SimpleTexting
    if (message.externalMessageId && message.status === 'sent') {
      const statusResult = await simpleTextingService.getMessageStatus(message.externalMessageId);
      
      if (statusResult.success && statusResult.status !== message.status) {
        message.status = statusResult.status;
        if (statusResult.status === 'delivered') {
          message.deliveredAt = new Date();
        }
        await message.save();
        console.log(`SMS Status: Updated message status to ${statusResult.status}`);
      }
    }

    res.json({
      messageId: message._id,
      status: message.status,
      sentAt: message.sentAt,
      deliveredAt: message.deliveredAt,
      errorMessage: message.errorMessage
    });

  } catch (error) {
    console.error('SMS Status: Error checking message status:', error);
    res.status(500).json({
      error: 'Failed to check message status'
    });
  }
});

module.exports = router;