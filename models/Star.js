'use strict';
const { sequelize, DataTypes } = require('./sequelize-loader');

const Star = sequelize.define(
  'star',
  {
    star_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    hitokoto_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    freezeTableName: true,
    timestamps: true,
  }
);

module.exports = Star;
