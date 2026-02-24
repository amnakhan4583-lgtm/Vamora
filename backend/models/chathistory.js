'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ChatHistory.init({
    patientId: DataTypes.INTEGER,
    message: DataTypes.TEXT,
    response: DataTypes.TEXT,
    moodDetected: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ChatHistory',
    tableName: 'chathistories',
  });
  return ChatHistory;
};
