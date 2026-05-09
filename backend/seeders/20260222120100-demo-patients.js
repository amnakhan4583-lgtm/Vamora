'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE email IN ('sarah.patient@vamora.com')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const find = (email) => users.find(u => u.email === email)?.id;
    const rows = [];
    if (find('sarah.patient@vamora.com')) rows.push({
      user_id: find('sarah.patient@vamora.com'),
      name: 'Sarah Johnson',
      date_of_birth: '1945-06-15',
      diagnosis_date: '2020-03-10',
      diagnosis_type: "Early-stage Alzheimer's Disease",
      profile_photo: null,
      created_at: new Date(),
      updated_at: new Date()
    });
    if (rows.length) await queryInterface.bulkInsert('patients', rows, {});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('patients', null, {});
  }
};
