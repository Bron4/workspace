const express = require('express');
const bitlyService = require('../services/bitlyService');
const { requireUser } = require('./middleware/auth');

const router = express.Router();

// POST /api/url/shorten - Shorten a URL
router.post('/shorten', requireUser, async (req, res) => {
  try {
    const { url } = req.body;
    console.log('URL Shorten: Received request for URL:', url);

    // Validation
    if (!url) {
      return res.status(400).json({
        error: 'URL is required'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid URL format'
      });
    }

    // Shorten URL using Bitly
    const result = await bitlyService.shortenUrl(url);

    if (result.success) {
      console.log(`URL Shorten: Successfully shortened ${url} to ${result.shortUrl}`);
      
      res.json({
        success: true,
        shortUrl: result.shortUrl,
        longUrl: result.longUrl,
        id: result.id
      });
    } else {
      console.log(`URL Shorten: Failed to shorten URL: ${result.error}`);
      
      res.status(500).json({
        error: result.error || 'Failed to shorten URL'
      });
    }

  } catch (error) {
    console.error('URL Shorten: Error processing request:', error);
    res.status(500).json({
      error: 'Failed to shorten URL'
    });
  }
});

// POST /api/url/expand - Expand a shortened URL
router.post('/expand', requireUser, async (req, res) => {
  try {
    const { shortUrl } = req.body;
    console.log('URL Expand: Received request for short URL:', shortUrl);

    // Validation
    if (!shortUrl) {
      return res.status(400).json({
        error: 'Short URL is required'
      });
    }

    // Expand URL using Bitly
    const result = await bitlyService.expandUrl(shortUrl);

    if (result.success) {
      console.log(`URL Expand: Successfully expanded ${shortUrl} to ${result.longUrl}`);
      
      res.json({
        success: true,
        longUrl: result.longUrl,
        shortUrl: result.shortUrl
      });
    } else {
      console.log(`URL Expand: Failed to expand URL: ${result.error}`);
      
      res.status(500).json({
        error: result.error || 'Failed to expand URL'
      });
    }

  } catch (error) {
    console.error('URL Expand: Error processing request:', error);
    res.status(500).json({
      error: 'Failed to expand URL'
    });
  }
});

module.exports = router;