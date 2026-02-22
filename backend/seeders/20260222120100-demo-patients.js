'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('patients', [
      {
        user_id: 1, // sarah.patient@vamora.com
        name: 'Sarah Johnson',
        date_of_birth: '1945-06-15',
        diagnosis_date: '2020-03-10',
        diagnosis_type: 'Early-stage Alzheimer\'s Disease',
        profile_photo: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 2, // john.patient@vamora.com
        name: 'John Anderson',
        date_of_birth: '1950-11-22',
        diagnosis_date: '2019-08-15',
        diagnosis_type: 'Vascular Dementia',
        profile_photo: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 3, // mary.patient@vamora.com
        name: 'Mary Williams',
        date_of_birth: '1948-02-08',
        diagnosis_date: '2021-01-20',
        diagnosis_type: 'Mixed Dementia',
        profile_photo: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('patients', null, {});
  }
};
