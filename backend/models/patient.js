'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Patient extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Patient belongs to User
      Patient.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      // Patient has many Media files
      Patient.hasMany(models.Media, {
        foreignKey: 'patientId',
        as: 'media'
      });

      // Patient has many Chat History records
      Patient.hasMany(models.ChatHistory, {
        foreignKey: 'patientId',
        as: 'chatHistory'
      });

      // Patient has many Caregivers through relationships
      Patient.belongsToMany(models.Caregiver, {
        through: 'patient_caregiver_relationships',
        foreignKey: 'patientId',
        otherKey: 'caregiverId',
        as: 'caregivers'
      });
    }

    /**
     * Calculate patient age
     */
    getAge() {
      if (!this.dateOfBirth) return null;
      const today = new Date();
      const birthDate = new Date(this.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }
  }

  Patient.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Name is required'
        },
        notEmpty: {
          msg: 'Name cannot be empty'
        },
        len: {
          args: [2, 100],
          msg: 'Name must be between 2 and 100 characters'
        }
      }
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: {
          msg: 'Must be a valid date'
        },
        isBefore: {
          args: new Date().toISOString(),
          msg: 'Date of birth must be in the past'
        }
      }
    },
    diagnosisDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      validate: {
        isDate: {
          msg: 'Must be a valid date'
        }
      }
    },
    diagnosisType: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: 'Diagnosis type must be less than 100 characters'
        }
      }
    },
    profilePhoto: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Patient',
    tableName: 'patients',
    timestamps: true,
    underscored: true
  });

  return Patient;
};
