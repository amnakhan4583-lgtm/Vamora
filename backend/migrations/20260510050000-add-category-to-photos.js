'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Photos', 'category', {
      type: Sequelize.ENUM('family', 'home', 'pet', 'memory'),
      allowNull: false,
      defaultValue: 'memory',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Photos', 'category');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Photos_category";');
  }
};
