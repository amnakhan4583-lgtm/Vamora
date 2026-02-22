'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('caregivers', [
      {
        user_id: 4, // amna.caregiver@vamora.com
        name: 'Amna Johnson',
        phone: '+1-555-0123',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 5, // david.caregiver@vamora.com
        name: 'David Anderson',
        phone: '+1-555-0456',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('caregivers', null, {});
  }
};
