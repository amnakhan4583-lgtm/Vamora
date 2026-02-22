import api from './api';

/**
 * User Service
 * Handles user management API calls
 */

export const userService = {
  /**
   * Get user by ID
   * @param {number} userId
   * @returns {Promise} User data
   */
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * Update user profile
   * @param {number} userId
   * @param {Object} updateData
   * @returns {Promise} Updated user data
   */
  updateProfile: async (userId, updateData) => {
    const response = await api.put(`/users/${userId}`, updateData);

    // Update stored user data
    const user = response.data.data;
    localStorage.setItem('user', JSON.stringify(user));

    return response.data;
  },

  /**
   * Change password
   * @param {number} userId
   * @param {Object} passwordData
   * @returns {Promise} Success message
   */
  changePassword: async (userId, passwordData) => {
    const response = await api.put(`/users/${userId}/password`, passwordData);
    return response.data;
  },

  /**
   * Delete account
   * @param {number} userId
   * @returns {Promise} Success message
   */
  deleteAccount: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  /**
   * Get all users (admin only)
   * @param {Object} filters
   * @returns {Promise} List of users
   */
  getAllUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);

    const response = await api.get(`/users?${params.toString()}`);
    return response.data;
  }
};

export default userService;
