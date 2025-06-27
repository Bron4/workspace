const axios = require('axios');

class BitlyService {
  constructor() {
    this.accessToken = process.env.BITLY_ACCESS_TOKEN;
    this.baseUrl = process.env.BITLY_BASE_URL || 'https://api-ssl.bitly.com/v4';
    
    if (!this.accessToken) {
      console.error('Bitly: Access token not configured');
    }
  }

  async shortenUrl(longUrl) {
    try {
      console.log(`Bitly: Shortening URL: ${longUrl}`);
      
      if (!this.accessToken) {
        throw new Error('Bitly access token not configured');
      }

      // Validate URL format
      if (!this.isValidUrl(longUrl)) {
        throw new Error('Invalid URL format');
      }

      const payload = {
        long_url: longUrl,
        domain: 'bit.ly'
      };

      console.log('Bitly: Sending request with payload:', payload);

      const response = await axios.post(`${this.baseUrl}/shorten`, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('Bitly: URL shortened successfully:', response.data);

      return {
        success: true,
        shortUrl: response.data.link,
        longUrl: response.data.long_url,
        id: response.data.id,
        data: response.data
      };

    } catch (error) {
      console.error('Bitly: Error shortening URL:', error.message);
      
      if (error.response) {
        console.error('Bitly: API Error Response:', error.response.data);
        return {
          success: false,
          error: error.response.data.message || error.response.data.description || 'Failed to shorten URL',
          statusCode: error.response.status
        };
      }
      
      return {
        success: false,
        error: error.message || 'Failed to shorten URL - network error'
      };
    }
  }

  async expandUrl(shortUrl) {
    try {
      console.log(`Bitly: Expanding URL: ${shortUrl}`);
      
      if (!this.accessToken) {
        throw new Error('Bitly access token not configured');
      }

      // Extract bitlink ID from URL
      const bitlinkId = this.extractBitlinkId(shortUrl);
      
      const response = await axios.get(`${this.baseUrl}/bitlinks/${bitlinkId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });

      console.log('Bitly: URL expanded successfully:', response.data);

      return {
        success: true,
        longUrl: response.data.long_url,
        shortUrl: response.data.link,
        data: response.data
      };

    } catch (error) {
      console.error('Bitly: Error expanding URL:', error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  extractBitlinkId(shortUrl) {
    // Extract bitlink ID from URLs like https://bit.ly/abc123
    const match = shortUrl.match(/bit\.ly\/(.+)$/);
    return match ? `bit.ly/${match[1]}` : shortUrl;
  }
}

module.exports = new BitlyService();