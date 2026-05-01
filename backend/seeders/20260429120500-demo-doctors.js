'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    await queryInterface.bulkInsert('users', [
      {
        email: 'sarah.md@vamora.com',
        password: hashedPassword,
        role: 'doctor',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        email: 'james.md@vamora.com',
        password: hashedPassword,
        role: 'doctor',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      email: ['sarah.md@vamora.com', 'james.md@vamora.com']
    }, {});
  }
};
