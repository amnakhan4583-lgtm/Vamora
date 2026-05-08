'use strict';
const bcrypt = require('bcryptjs');

// Default credential — change immediately after first login in production.
const ADMIN_EMAIL    = 'admin@vamora.hospital';
const ADMIN_PASSWORD = 'Admin@Vamora2026!';

module.exports = {
  async up(queryInterface) {
    // Idempotent: skip if the record already exists.
    const existing = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = :email LIMIT 1`,
      {
        replacements: { email: ADMIN_EMAIL },
        type: queryInterface.sequelize.QueryTypes.SELECT
      }
    );

    if (existing.length > 0) return;

    // bulkInsert bypasses Sequelize model hooks, so we hash manually.
    const password = await bcrypt.hash(ADMIN_PASSWORD, 10);

    await queryInterface.bulkInsert('users', [{
      email:      ADMIN_EMAIL,
      password,
      role:       'super_admin',
      is_active:  true,
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: ADMIN_EMAIL }, {});
  }
};
