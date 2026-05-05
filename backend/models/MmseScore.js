'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MmseScore extends Model {
    static associate(models) {
      // patientId = user.id (same convention as Mood, Photo, ChatMessage)
    }
  }

  MmseScore.init({
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    patientId: { type: DataTypes.INTEGER, allowNull: false },
    doctorId: { type: DataTypes.INTEGER, allowNull: false },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0, max: 30 }
    },
    notes: { type: DataTypes.TEXT, allowNull: true },
    assessmentDate: { type: DataTypes.DATEONLY, allowNull: false }
  }, {
    sequelize,
    modelName: 'MmseScore',
    tableName: 'mmse_scores',
    timestamps: true,
    underscored: true
  });

  return MmseScore;
};
