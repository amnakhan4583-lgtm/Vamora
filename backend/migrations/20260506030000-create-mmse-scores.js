'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('mmse_scores', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      patient_id: { type: Sequelize.INTEGER, allowNull: false },
      doctor_id: { type: Sequelize.INTEGER, allowNull: false },
      score: { type: Sequelize.INTEGER, allowNull: false },
      notes: { type: Sequelize.TEXT, allowNull: true },
      assessment_date: { type: Sequelize.DATEONLY, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('mmse_scores');
  }
};
