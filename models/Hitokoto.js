'use strict';
const { sequelize, DataTypes } = require('./sequelize-loader');

const Hitokoto = sequelize.define(
  'hitokoto',
  {
    hitokoto_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    hitokoto: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    theme_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    state : {
      type: DataTypes.INTEGER,
      allowNull: false
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
