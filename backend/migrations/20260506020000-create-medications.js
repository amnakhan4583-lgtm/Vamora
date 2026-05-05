'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('medications', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      patient_id: { type: Sequelize.INTEGER, allowNull: false },
      doctor_id: { type: Sequelize.INTEGER, allowNull: false },
      medication_name: { type: Sequelize.STRING, allowNull: false },
      dosage: { type: Sequelize.STRING, allowNull: true },
      frequency: { type: Sequelize.STRING, allowNull: true },
      timing: { type: Sequelize.STRING, allowNull: true },
      start_date: { type: Sequelize.DATEONLY, allowNull: true },
      end_date: { type: Sequelize.DATEONLY, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('medications');
  }
};
