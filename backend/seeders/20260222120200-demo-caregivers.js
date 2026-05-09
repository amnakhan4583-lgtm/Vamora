'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE email IN ('amna.caregiver@vamora.com')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const find = (email) => users.find(u => u.email === email)?.id;
    const rows = [];
    if (find('amna.caregiver@vamora.com')) rows.push({
      user_id: find('amna.caregiver@vamora.com'),
      name: 'Amna Khan',
      phone: '+1-555-0123',
      created_at: new Date(),
      updated_at: new Date()
    });
    if (rows.length) await queryInterface.bulkInsert('caregivers', rows, {});
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('caregivers', null, {});
  }
};
