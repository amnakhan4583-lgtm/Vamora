'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Appointment extends Model {
    static associate(models) {
      Appointment.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
      Appointment.belongsTo(models.Caregiver, { foreignKey: 'caregiverId', as: 'caregiver' });
    }
  }

  Appointment.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    patientId: { type: DataTypes.INTEGER, allowNull: false },
    caregiverId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    doctorName: { type: DataTypes.STRING, allowNull: true },
    appointmentType: { type: DataTypes.STRING, allowNull: true },
    appointmentDate: { type: DataTypes.DATE, allowNull: false },
    notes: { type: DataTypes.TEXT, allowNull: true }
  }, {
    sequelize,
    modelName: 'Appointment',
    tableName: 'appointments',
    timestamps: true,
    underscored: true
  });

  return Appointment;
};