const express = require('express');
const UserService = require('../services/userService.js');
const { requireUser } = require('./middleware/auth.js');
const User = require('../models/User.js');
const { generateAccessToken, generateRefreshToken } = require('../utils/auth.js');
const jwt = require('jsonwebtoken');

const router = express.Router();

router.post('/login', async (req, res) => {
  const sendError = msg => res.status(400).json({ message: msg });
  const { email, password } = req.body;

  console.log(`Login attempt for email: ${email}`);

  if (!email || !password) {
    return sendError('Email and password are required');
  }

  try {
    const user = await UserService.authenticateWithPassword(email, password);

    if (user) {
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      user.refreshToken = refreshToken;
      await user.save();
      
      console.log(`Login successful for user: ${email} with role: ${user.role}`);
      return res.json({...user.toObject(), accessToken, refreshToken});
    } else {
      console.log(`Login failed for email: ${email} - invalid credentials`);
      return sendError('Email or password is incorrect');
    }
  } catch (error) {
    console.error(`Login error for ${email}: ${error.message}`);
    return sendError('An error occurred during login');
  }
});

router.post('/register', async (req, res, next) => {
  if (req.user) {
    return res.json({ user: req.user });
  }
  
  console.log(`Registration attempt for email: ${req.body.email} with role: ${req.body.role}`);
  
  try {
    const user = await UserService.create(req.body);
    console.log(`Registration successful for user: ${user.email} with role: ${user.role}`);
    return res.status(200).json(user);
  } catch (error) {
    console.error(`Registration error: ${error.message}`);
    return res.status(400).json({ message: error.message });
  }
});

router.post('/logout', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    user.refreshToken = null;
    await user.save();
    console.log(`User logged out: ${email}`);
  }

  res.status(200).json({ message: 'User logged out successfully.' });
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Find the user
    const user = await UserService.get(decoded.sub);

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.refreshToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update user's refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    // Return new tokens
    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error(`Token refresh error: ${error.message}`);

    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Refresh token has expired'
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

router.get('/me', requireUser, async (req, res) => {
  console.log(`Current user info requested for: ${req.user.email}`);
  return res.status(200).json(req.user);
});

module.exports = router;