'use strict';

/**
 * Adds 'doctor' to the users.role ENUM.
 *
 * PostgreSQL does not support removing ENUM values, so the `down`
 * migration is intentionally left as a no-op. If you need to revert,
 * drop and recreate the ENUM type manually.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(
      "ALTER TYPE \"enum_users_role\" ADD VALUE 'doctor';"
    );
  },

  async down() {
    // PostgreSQL cannot drop individual ENUM values — no-op.
  }
};
