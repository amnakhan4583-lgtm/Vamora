'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Moods', 'source', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'manual',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Moods', 'source');
  }
};
