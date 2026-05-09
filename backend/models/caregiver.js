'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Caregiver extends Model {
    static associate(models) {
      Caregiver.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Caregiver.belongsToMany(models.Patient, {
        through: 'patient_caregiver_relationships',
        foreignKey: 'caregiver_id',
        otherKey: 'patient_id',
        as: 'patients'
      });
      Caregiver.hasMany(models.Appointment, { foreignKey: 'caregiverId', as: 'appointments' });
      Caregiver.hasMany(models.CareNote, { foreignKey: 'caregiverId', as: 'careNotes' });

      // Caregiver belongs to the doctor they are linked to
      Caregiver.belongsTo(models.User, {
        foreignKey: 'doctorId',
        as: 'doctor'
      });
    }
  }

  Caregiver.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: true },
    doctorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    isLocked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  }, {
    sequelize,
    modelName: 'Caregiver',
    tableName: 'caregivers',
    timestamps: true,
    underscored: true
  });

  return Caregiver;
};