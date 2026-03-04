'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Mood extends Model {
    static associate(models) {
      Mood.belongsTo(models.User, { foreignKey: 'patientId' });
    }
  }

  Mood.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    mood: {
      type: DataTypes.STRING,
      allowNull: false
    },
    note: {
      type: DataTypes.TEXT
    },
    recordedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Mood',
  });

  return Mood;
};