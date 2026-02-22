'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash passwords
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
        email: 'john.patient@vamora.com',
        password: hashedPassword,
        role: 'patient',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'mary.patient@vamora.com',
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
        email: 'david.caregiver@vamora.com',
        password: hashedPassword,
        role: 'caregiver',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'admin@vamora.com',
        password: hashedPassword,
        role: 'admin',
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
