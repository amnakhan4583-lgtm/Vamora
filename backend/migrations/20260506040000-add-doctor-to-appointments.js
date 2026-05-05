'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('appointments', 'doctor_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
    // Make caregiverId nullable so doctor-created appointments don't need it
    await queryInterface.sequelize.query(
      'ALTER TABLE appointments ALTER COLUMN caregiver_id DROP NOT NULL;'
    );
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('appointments', 'doctor_id');
    await queryInterface.sequelize.query(
      'ALTER TABLE appointments ALTER COLUMN caregiver_id SET NOT NULL;'
    );
  }
};
