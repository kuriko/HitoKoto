'use strict';
const { sequelize, DataTypes } = require('./sequelize-loader');

const User = sequelize.define(
  'user',
  {
    user_id: { // GitHub UserID
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    username: { // GitHub Username
      type: DataTypes.STRING,
      allowNull: false
    }
  },
   {
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = User;