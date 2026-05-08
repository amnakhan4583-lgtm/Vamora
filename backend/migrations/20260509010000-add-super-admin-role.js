'use strict';

/**
 * Adds 'super_admin' to the users.role ENUM.
 *
 * PostgreSQL does not support removing ENUM values, so the `down`
 * migration is intentionally left as a no-op.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TYPE \"enum_users_role\" ADD VALUE IF NOT EXISTS 'super_admin';"
    );
  },

  async down() {
    // PostgreSQL cannot drop individual ENUM values — no-op.
  }
};
