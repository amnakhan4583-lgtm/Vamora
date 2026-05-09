'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await queryInterface.bulkInsert('users', [
      {
        email: 'sarah.patient@vamora.com',
        password: hashedPassword,
        role: 'patient',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'amna.caregiver@vamora.com',
        password: hashedPassword,
        role: 'caregiver',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'sarah.md@vamora.com',
        password: hashedPassword,
        role: 'doctor',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
