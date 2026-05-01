'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Track which doctor created each patient
    await queryInterface.addColumn('patients', 'created_by_doctor_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Link each caregiver to the doctor they work under
    await queryInterface.addColumn('caregivers', 'doctor_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('patients', 'created_by_doctor_id');
    await queryInterface.removeColumn('caregivers', 'doctor_id');
  }
};
