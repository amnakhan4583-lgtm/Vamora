const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');
const {
  updateProfileValidation,
  changePasswordValidation
} = require('../utils/validators');

/**
 * User Management Routes
 * Base path: /api/v1/users
 * All routes require authentication
 */

/**
 * @route   GET /api/v1/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin)
 * @query   role, isActive
 */
router.get('/',
  authenticate,
  authorize('admin'),
  userController.getAllUsers
);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user profile by ID
 * @access  Private (Self or Admin)
 */
router.get('/:id',
  authenticate,
  userController.getUserProfile
);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user profile
 * @access  Private (Self or Admin)
 * @body    { name?, email?, phone?, dateOfBirth?, diagnosisDate?, diagnosisType?, profilePhoto?, relationship? }
 */
router.put('/:id',
  authenticate,
  updateProfileValidation,
  userController.updateUserProfile
);

/**
 * @route   PUT /api/v1/users/:id/password
 * @desc    Change user password
 * @access  Private (Self only)
 * @body    { currentPassword, newPassword, confirmPassword }
 */
router.put('/:id/password',
  authenticate,
  changePasswordValidation,
  userController.changeUserPassword
);

/**
 * @route   PATCH /api/v1/users/:id/status
 * @desc    Activate/deactivate user account
 * @access  Private (Admin only)
 * @body    { isActive: boolean }
 */
router.patch('/:id/status',
  authenticate,
  authorize('admin'),
  userController.updateAccountStatus
);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user account (soft delete)
 * @access  Private (Self or Admin)
 */
router.delete('/:id',
  authenticate,
  userController.deleteUserAccount
);

module.exports = router;
