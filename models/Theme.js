'use strict';
const { sequelize, DataTypes } = require('./sequelize-loader');

const Theme = sequelize.define(
  'theme',
  {
    theme_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    theme: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
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

module.exports = Theme;
