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
      // define association here
    }
  }
  Media.init({
    patientId: DataTypes.INTEGER,
    mediaType: DataTypes.ENUM,
    filename: DataTypes.STRING,
    filepath: DataTypes.STRING,
    fileSize: DataTypes.INTEGER,
    mimeType: DataTypes.STRING,
    uploadedBy: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Media',
  });
  return Media;
};