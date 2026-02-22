const userService = require('../services/userService');
const { validationResult } = require('express-validator');

/**
 * User Controller
 * Handles HTTP requests and responses for user management
 */

/**
 * Get user profile by ID
 * GET /api/v1/users/:id
 */
const getUserProfile = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const requestingUserId = req.user.id;
    const requestingUserRole = req.user.role;

    // Users can only view their own profile unless they're admin
    if (userId !== requestingUserId && requestingUserRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own profile.'
      });
    }

    const user = await userService.getUserById(userId);

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
 * Update user profile
 * PUT /api/v1/users/:id
 */
const updateUserProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = parseInt(req.params.id);
    const requestingUserId = req.user.id;
    const requestingUserRole = req.user.role;

    // Users can only update their own profile unless they're admin
    if (userId !== requestingUserId && requestingUserRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own profile.'
      });
    }

    const updateData = req.body;
    const updatedUser = await userService.updateProfile(userId, updateData);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Email is already in use') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Change user password
 * PUT /api/v1/users/:id/password
 */
const changeUserPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = parseInt(req.params.id);
    const requestingUserId = req.user.id;

    // Users can only change their own password
    if (userId !== requestingUserId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only change your own password.'
      });
    }

    const { currentPassword, newPassword } = req.body;
    await userService.changePassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    if (error.message === 'User not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Current password is incorrect') {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

/**
 * Update account status (activate/deactivate)
 * PATCH /api/v1/users/:id/status
 */
const updateAccountStatus = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive must be a boolean value'
      });
    }

    const updatedUser = await userService.updateAccountStatus(userId, isActive);

    res.status(200).json({
      success: true,
      message: `Account ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedUser
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
 * Delete user account
 * DELETE /api/v1/users/:id
 */
const deleteUserAccount = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id);
    const requestingUserId = req.user.id;
    const requestingUserRole = req.user.role;

    // Users can only delete their own account unless they're admin
    if (userId !== requestingUserId && requestingUserRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own account.'
      });
    }

    await userService.deleteAccount(userId);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
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
 * Get all users (admin only)
 * GET /api/v1/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const filters = {
      role: req.query.role,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined
    };

    const users = await userService.getAllUsers(filters);

    res.status(200).json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  updateAccountStatus,
  deleteUserAccount,
  getAllUsers
};
