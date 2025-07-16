// FORCE REDEPLOY - FIXING SMS BUG - REMOVE /API FROM URL
const axios = require('axios');

class SimpleTextingService {
  constructor() {
    this.apiKey = process.env.SIMPLETEXTING_API_KEY;
    this.baseUrl = process.env.SIMPLETEXTING_BASE_URL || 'https://app.simpletexting.com/v2';
    
    // Use mock mode if:
    // 1. No API key configured
    // 2. NODE_ENV is development
    // 3. API key looks like a placeholder/test key
    // 4. NODE_ENV is not explicitly set to production
    this.mockMode = !this.apiKey || 
                   process.env.NODE_ENV === 'development' || 
                   process.env.NODE_ENV !== 'production' ||
                   this.apiKey.length < 20; // Placeholder keys are usually shorter

    if (this.mockMode) {
      console.log('SimpleTexting: Using mock mode for development');
    } else {
      console.log('SimpleTexting: Using real API mode');
    }
  }

  async sendSMS(phoneNumber, message) {
    try {
      console.log(`SimpleTexting: Sending SMS to ${phoneNumber}`);

      // Use mock mode for development
      if (this.mockMode) {
        console.log('SimpleTexting: Using mock mode - simulating successful SMS send');
        console.log('SimpleTexting: Mock SMS content:', message);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockResponse = {
          id: `mock_${Date.now()}`,
          status: 'sent',
          phone: phoneNumber,
          message: message,
          timestamp: new Date().toISOString()
        };

        console.log('SimpleTexting: Mock SMS sent successfully:', mockResponse);

        return {
          success: true,
          messageId: mockResponse.id,
          status: mockResponse.status,
          data: mockResponse
        };
      }

      // Real API implementation (for production)
      console.log(`SimpleTexting: API Key configured:`, this.apiKey ? 'YES' : 'NO');
      console.log(`SimpleTexting: Base URL:`, this.baseUrl);

      if (!this.apiKey) {
        throw new Error('SimpleTexting API key not configured');
      }

      // Clean phone number - remove any formatting
      const cleanPhone = phoneNumber.replace(/\D/g, '');

      // Ensure phone number has country code
      const formattedPhone = cleanPhone.startsWith('1') ? cleanPhone : `1${cleanPhone}`;

      const payload = {
        text: message,
        phone: formattedPhone
      };

      const headers = {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json'
      };

      const fullUrl = `${this.baseUrl}/messages`; // FIXED: removed /api from path
      console.log('SimpleTexting: Full request URL:', fullUrl);
      console.log('SimpleTexting: Request headers:', {
        'X-API-Key': `${this.apiKey.substring(0, 8)}...`,
        'Content-Type': 'application/json'
      });
      console.log('SimpleTexting: Sending request with payload:', {
        ...payload,
        phone: `***-***-${formattedPhone.slice(-4)}`
      });

      const response = await axios.post(fullUrl, payload, {
        headers,
        timeout: 10000 // 10 second timeout
      });

      console.log('SimpleTexting: SMS sent successfully, response:', response.data);

      return {
        success: true,
        messageId: response.data.id || response.data.message_id,
        status: response.data.status || 'sent',
        data: response.data
      };

    } catch (error) {
      console.error('SimpleTexting: Error sending SMS:', error.message);
      console.error('SimpleTexting: Request config:', error.config ? {
        url: error.config.url,
        method: error.config.method,
        headers: error.config.headers
      } : 'No config available');

      if (error.response) {
        console.error('SimpleTexting: API Error Response:', error.response.data);
        return {
          success: false,
          error: error.response.data.message || error.response.data.error || 'Failed to send SMS',
          statusCode: error.response.status
        };
      }

      return {
        success: false,
        error: error.message || 'Failed to send SMS - network error'
      };
    }
  }

  async getMessageStatus(messageId) {
    try {
      console.log(`SimpleTexting: Getting status for message ${messageId}`);

      // Mock mode
      if (this.mockMode) {
        console.log('SimpleTexting: Using mock mode - simulating message status check');

        const mockStatus = {
          id: messageId,
          status: messageId.startsWith('mock_') ? 'delivered' : 'sent',
          timestamp: new Date().toISOString()
        };

        return {
          success: true,
          status: mockStatus.status,
          data: mockStatus
        };
      }

      // Real API implementation
      if (!this.apiKey) {
        throw new Error('SimpleTexting API key not configured');
      }

      const response = await axios.get(`${this.baseUrl}/messages/${messageId}`, {
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      console.log('SimpleTexting: Message status retrieved:', response.data);

      return {
        success: true,
        status: response.data.status,
        data: response.data
      };

    } catch (error) {
      console.error('SimpleTexting: Error getting message status:', error.message);

      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }
}

module.exports = new SimpleTextingService();
