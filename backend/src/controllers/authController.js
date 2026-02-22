const authService = require('../services/authService');
const { validationResult } = require('express-validator');

/**
 * Authentication Controller
 * Handles HTTP requests and responses for authentication
 */

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
const register = async (req, res, next) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, role, name, dateOfBirth, phone } = req.body;

    const result = await authService.register({
      email,
      password,
      role,
      name,
      dateOfBirth,
      phone
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result
    });
  } catch (error) {
    if (error.message === 'Email is already registered') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Login user
 * POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    const result = await authService.login(email, password);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result
    });
  } catch (error) {
    if (error.message.includes('Invalid email or password') ||
        error.message.includes('deactivated')) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Get current user profile
 * GET /api/v1/auth/me
 */
const getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await authService.getCurrentUser(userId);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: result
    });
  } catch (error) {
    if (error.message.includes('Invalid or expired')) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Logout user
 * POST /api/v1/auth/logout
 * Note: For JWT-based auth, logout is typically handled on the client side
 * by removing the tokens. This endpoint can be used for additional server-side cleanup
 * or to maintain logout logs.
 */
const logout = async (req, res) => {
  // In a stateless JWT setup, we typically just return success
  // Client will remove tokens from storage
  // You could add token blacklisting here if needed

  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

module.exports = {
  register,
  login,
  getCurrentUser,
  refresh,
  logout
};
