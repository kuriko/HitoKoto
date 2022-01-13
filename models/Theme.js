'use strict';
const { sequelize, DataTypes } = require('./sequelize-loader');

const Theme = sequelize.define(
  'theme',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
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
    timestamps: false,
    indexes: [
      {
        fields: ['user_id']
      }
    ]
  }
);

module.exports = Theme;
