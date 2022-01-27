'use strict';
const {Sequelize, DataTypes} = require('sequelize');

// 本番環境用
function createProd() {
  return new Sequelize(
    process.env.DATABASE_URL,
    {
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    }
  );
}

// 開発環境用
function createDev() {
  return new Sequelize(
    'postgres://postgres:postgres@db/hitokoto',
    { logging: true }
  );
}

module.exports = {
  sequelize: process.env.DATABASE_URL ? createProd() : createDev(),
  DataTypes
};
