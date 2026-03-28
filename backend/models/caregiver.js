'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Caregiver extends Model {
    static associate(models) {
      Caregiver.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Caregiver.belongsToMany(models.Patient, {
        through: 'patient_caregiver_relationships',
        foreignKey: 'caregiverId',
        otherKey: 'patientId',
        as: 'patients'
      });
      Caregiver.hasMany(models.Appointment, { foreignKey: 'caregiverId', as: 'appointments' });
      Caregiver.hasMany(models.CareNote, { foreignKey: 'caregiverId', as: 'careNotes' });
    }
  }

  Caregiver.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: true }
  }, {
    sequelize,
    modelName: 'Caregiver',
    tableName: 'caregivers',
    timestamps: true,
    underscored: true
  });

  return Caregiver;
};