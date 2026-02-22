const db = require('../../models');
const { generateAccessToken, generateRefreshToken } = require('../config/jwt');

/**
 * Authentication Service
 * Contains business logic for authentication operations
 */

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} Created user and tokens
 */
const register = async (userData) => {
  const { email, password, role, name, dateOfBirth, phone } = userData;

  // Check if user already exists
  const existingUser = await db.User.findOne({ where: { email } });

  if (existingUser) {
    throw new Error('Email is already registered');
  }

  // Start transaction
  const transaction = await db.sequelize.transaction();

  try {
    // Create user
    const user = await db.User.create({
      email,
      password, // Will be hashed by model hook
      role: role || 'patient'
    }, { transaction });

    // Create patient or caregiver profile based on role
    if (user.role === 'patient') {
      await db.Patient.create({
        userId: user.id,
        name,
        dateOfBirth: dateOfBirth || null
      }, { transaction });
    } else if (user.role === 'caregiver') {
      await db.Caregiver.create({
        userId: user.id,
        name,
        phone: phone || null
      }, { transaction });
    }

    await transaction.commit();

    // Generate tokens
    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email });

    // Return user data without password
    const userResponse = user.toSafeObject();

    return {
      user: userResponse,
      accessToken,
      refreshToken
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Login user
 * @param {String} email - User email
 * @param {String} password - User password
 * @returns {Object} User and tokens
 */
const login = async (email, password) => {
  // Find user by email
  const user = await db.User.findOne({
    where: { email },
    include: [
      { model: db.Patient, as: 'patientProfile' },
      { model: db.Caregiver, as: 'caregiverProfile' }
    ]
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Check if account is active
  if (!user.isActive) {
    throw new Error('Your account has been deactivated. Please contact support.');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate tokens
  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role
  });
  const refreshToken = generateRefreshToken({
    id: user.id,
    email: user.email
  });

  // Prepare user response
  const userResponse = {
    ...user.toSafeObject(),
    profile: user.role === 'patient' ? user.patientProfile : user.caregiverProfile
  };

  return {
    user: userResponse,
    accessToken,
    refreshToken
  };
};

/**
 * Get current user profile
 * @param {Number} userId - User ID
 * @returns {Object} User profile
 */
const getCurrentUser = async (userId) => {
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
 * Refresh access token
 * @param {String} refreshToken - Refresh token
 * @returns {Object} New access token
 */
const refreshAccessToken = async (refreshToken) => {
  const { verifyRefreshToken } = require('../config/jwt');

  try {
    const decoded = verifyRefreshToken(refreshToken);

    // Verify user still exists and is active
    const user = await db.User.findByPk(decoded.id);

    if (!user || !user.isActive) {
      throw new Error('User not found or inactive');
    }

    // Generate new access token
    const newAccessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return { accessToken: newAccessToken };
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  refreshAccessToken
};
