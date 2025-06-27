const mongoose = require('mongoose');

const smsMessageSchema = new mongoose.Schema({
  cityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'City',
    required: true
  },
  technicianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician',
    required: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  messageContent: {
    type: String,
    required: true
  },
  originalUrl: {
    type: String,
    required: false
  },
  shortenedUrl: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed', 'delivered'],
    default: 'pending'
  },
  externalMessageId: {
    type: String,
    required: false
  },
  errorMessage: {
    type: String,
    required: false
  },
  sentAt: {
    type: Date,
    required: false
  },
  deliveredAt: {
    type: Date,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt on save
smsMessageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
smsMessageSchema.index({ createdAt: -1 });
smsMessageSchema.index({ status: 1 });
smsMessageSchema.index({ customerPhone: 1 });

module.exports = mongoose.model('SmsMessage', smsMessageSchema);