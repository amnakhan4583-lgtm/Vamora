'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CareNote extends Model {
    static associate(models) {
      CareNote.belongsTo(models.Patient, { foreignKey: 'patientId', as: 'patient' });
      CareNote.belongsTo(models.Caregiver, { foreignKey: 'caregiverId', as: 'caregiver' });
    }
  }

  CareNote.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    patientId: { type: DataTypes.INTEGER, allowNull: false },
    caregiverId: { type: DataTypes.INTEGER, allowNull: false },
    note: { type: DataTypes.TEXT, allowNull: false }
  }, {
    sequelize,
    modelName: 'CareNote',
    tableName: 'care_notes',
    timestamps: true,
    underscored: true
  });

  return CareNote;
};