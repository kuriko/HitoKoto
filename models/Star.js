'use strict';
const { sequelize, DataTypes } = require('./sequelize-loader');

const Star = sequelize.define(
  'star',
  {
    hitokoto_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    stared: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = Star;
