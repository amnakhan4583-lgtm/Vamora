'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // User has one Patient profile (if role is patient)
      User.hasOne(models.Patient, {
        foreignKey: 'userId',
        as: 'patientProfile'
      });

      // User has one Caregiver profile (if role is caregiver)
      User.hasOne(models.Caregiver, {
        foreignKey: 'userId',
        as: 'caregiverProfile'
      });
    }

    /**
     * Method to compare password for login
     */
    async comparePassword(candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
    }

    /**
     * Instance method to get safe user data (exclude password)
     */
    toSafeObject() {
      const { id, email, role, isActive, createdAt, updatedAt } = this;
      return { id, email, role, isActive, createdAt, updatedAt };
    }
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Email address already in use'
      },
      validate: {
        isEmail: {
          msg: 'Must be a valid email address'
        },
        notNull: {
          msg: 'Email is required'
        },
        notEmpty: {
          msg: 'Email cannot be empty'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Password is required'
        },
        notEmpty: {
          msg: 'Password cannot be empty'
        },
        len: {
          args: [6, 100],
          msg: 'Password must be between 6 and 100 characters'
        }
      }
    },
    role: {
      type: DataTypes.ENUM('patient', 'caregiver', 'admin'),
      allowNull: false,
      defaultValue: 'patient',
      validate: {
        isIn: {
          args: [['patient', 'caregiver', 'admin']],
          msg: 'Role must be either patient, caregiver, or admin'
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      // Hash password before creating user
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      // Hash password before updating if it was changed
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  return User;
};
