'use strict';
const { sequelize, DataTypes } = require('./sequelize-loader');

const User = sequelize.define(
  'user',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
   {
    freezeTableName: true,
    timestamps: false
  }
);

module.exports = User;