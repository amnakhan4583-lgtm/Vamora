'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Photo extends Model {
    static associate(models) {
      Photo.belongsTo(models.User, { foreignKey: 'patientId' });
    }
  }

  Photo.init({
    id: { 
      type: DataTypes.UUID, 
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true 
    },
     patientId: { 
  type: DataTypes.INTEGER, 
  allowNull: false 
    },
    filename: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    originalName: { 
      type: DataTypes.STRING 
    },
    caption: { 
      type: DataTypes.TEXT, 
      allowNull: false  // ✅ mandatory
    },
    takenAt: { 
      type: DataTypes.DATE 
    },
    voiceNoteUrl: { 
      type: DataTypes.STRING    // ✅ optional
    },
  }, {
    sequelize,
    modelName: 'Photo',
  });

  return Photo;
};