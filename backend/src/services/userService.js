const db = require('../../models');
const bcrypt = require('bcryptjs');

/**
 * User Service
 * Contains business logic for user management operations
 */

/**
 * Get user by ID with profile
 * @param {Number} userId - User ID
 * @returns {Object} User data with profile
 */
const getUserById = async (userId) => {
  const user = await db.User.findByPk(userId, {
    attributes: { exclude: ['password'] },
    include: [
      { model: db.Patient, as: 'patientProfile' },
      { model: db.Caregiver, as: 'caregiverProfile' }
    ]
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    ...user.toJSON(),
    profile: user.role === 'patient' ? user.patientProfile : user.caregiverProfile
  };
};

/**
 * Update user profile
 * @param {Number} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Object} Updated user data
 */
const updateProfile = async (userId, updateData) => {
  const transaction = await db.sequelize.transaction();

  try {
    const user = await db.User.findByPk(userId, {
      include: [
        { model: db.Patient, as: 'patientProfile' },
        { model: db.Caregiver, as: 'caregiverProfile' }
      ],
      transaction
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update user email if provided
    if (updateData.email && updateData.email !== user.email) {
      // Check if email is already taken
      const existingUser = await db.User.findOne({
        where: { email: updateData.email },
        transaction
      });

      if (existingUser) {
        throw new Error('Email is already in use');
      }

      user.email = updateData.email;
      await user.save({ transaction });
    }

    // Update profile data based on role
    if (user.role === 'patient' && user.patientProfile) {
      const profileUpdates = {};

      if (updateData.name) profileUpdates.name = updateData.name;
      if (updateData.dateOfBirth) profileUpdates.dateOfBirth = updateData.dateOfBirth;
      if (updateData.diagnosisDate) profileUpdates.diagnosisDate = updateData.diagnosisDate;
      if (updateData.diagnosisType) profileUpdates.diagnosisType = updateData.diagnosisType;
      if (updateData.profilePhoto !== undefined) profileUpdates.profilePhoto = updateData.profilePhoto;

      if (Object.keys(profileUpdates).length > 0) {
        await user.patientProfile.update(profileUpdates, { transaction });
      }
    } else if (user.role === 'caregiver' && user.caregiverProfile) {
      const profileUpdates = {};

      if (updateData.name) profileUpdates.name = updateData.name;
      if (updateData.phone) profileUpdates.phone = updateData.phone;
      if (updateData.relationship) profileUpdates.relationship = updateData.relationship;

      if (Object.keys(profileUpdates).length > 0) {
        await user.caregiverProfile.update(profileUpdates, { transaction });
      }
    }

    await transaction.commit();

    // Fetch updated user data
    return await getUserById(userId);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Change user password
 * @param {Number} userId - User ID
 * @param {String} currentPassword - Current password
 * @param {String} newPassword - New password
 * @returns {Boolean} Success status
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await db.User.findByPk(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Update password (will be hashed by model hook)
  user.password = newPassword;
  await user.save();

  return true;
};

/**
 * Update user account status (activate/deactivate)
 * @param {Number} userId - User ID
 * @param {Boolean} isActive - Active status
 * @returns {Object} Updated user data
 */
const updateAccountStatus = async (userId, isActive) => {
  const user = await db.User.findByPk(userId);

  if (!user) {
    throw new Error('User not found');
  }

  user.isActive = isActive;
  await user.save();

  return user.toSafeObject();
};

/**
 * Delete user account (soft delete by deactivating)
 * @param {Number} userId - User ID
 * @returns {Boolean} Success status
 */
const deleteAccount = async (userId) => {
  const user = await db.User.findByPk(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Soft delete by deactivating account
  user.isActive = false;
  await user.save();

  return true;
};

/**
 * Get all users (admin only)
 * @param {Object} filters - Filter options
 * @returns {Array} List of users
 */
const getAllUsers = async (filters = {}) => {
  const where = {};

  if (filters.role) where.role = filters.role;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  const users = await db.User.findAll({
    where,
    attributes: { exclude: ['password'] },
    include: [
      { model: db.Patient, as: 'patientProfile' },
      { model: db.Caregiver, as: 'caregiverProfile' }
    ],
    order: [['createdAt', 'DESC']]
  });

  return users.map(user => ({
    ...user.toJSON(),
    profile: user.role === 'patient' ? user.patientProfile : user.caregiverProfile
  }));
};

module.exports = {
  getUserById,
  updateProfile,
  changePassword,
  updateAccountStatus,
  deleteAccount,
  getAllUsers
};
