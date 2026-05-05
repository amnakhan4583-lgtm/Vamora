'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Doctor extends Model {
    static associate(models) {
      Doctor.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  Doctor.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: true },
    specialization: { type: DataTypes.STRING, allowNull: true },
    licenseNumber: { type: DataTypes.STRING, allowNull: true }
  }, {
    sequelize,
    modelName: 'Doctor',
    tableName: 'doctors',
    timestamps: true,
    underscored: true
  });

  return Doctor;
};
