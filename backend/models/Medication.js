'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Medication extends Model {
    static associate(models) {
      // patientId = user.id (same convention as Mood, Photo, ChatMessage)
    }
  }

  Medication.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    patientId: { type: DataTypes.INTEGER, allowNull: false },
    doctorId: { type: DataTypes.INTEGER, allowNull: false },
    medicationName: { type: DataTypes.STRING, allowNull: false },
    dosage: { type: DataTypes.STRING, allowNull: true },
    frequency: { type: DataTypes.STRING, allowNull: true },
    timing: { type: DataTypes.STRING, allowNull: true },
    startDate: { type: DataTypes.DATEONLY, allowNull: true },
    endDate: { type: DataTypes.DATEONLY, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true }
  }, {
    sequelize,
    modelName: 'Medication',
    tableName: 'medications',
    timestamps: true,
    underscored: true
  });

  return Medication;
};
