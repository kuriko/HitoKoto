'use strict';
const { sequelize, DataTypes } = require('./sequelize-loader');

const Hitokoto = sequelize.define(
  'hitokoto',
  {
    hitokoto_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    hitokoto: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    theme_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    star_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    state : {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  },
  {
    freezeTableName: true,
    timestamps: true,
    indexes: [
      {
        fields: ['user_id']
      }
    ]
  }
);

module.exports = Hitokoto;
