'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Media extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Media belongs to Patient
      Media.belongsTo(models.Patient, {
        foreignKey: 'patientId',
        as: 'patient'
      });

      // Media belongs to User (uploaded by)
      Media.belongsTo(models.User, {
        foreignKey: 'uploadedBy',
        as: 'uploader'
      });
    }
  }
  Media.init({
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Patients',
        key: 'id'
      }
    },
    mediaType: {
      type: DataTypes.ENUM('photo', 'video', 'audio'),
      allowNull: false
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filepath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    uploadedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Media',
    tableName: 'media',
    underscored: true,
    timestamps: true
  });
  return Media;
};
