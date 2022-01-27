'use strict';
const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const { sequelize, DataTypes } = require('../models/sequelize-loader');
const User = require('../models/User');
const Theme = require('../models/Theme');
const Hitokoto = require('../models/Hitokoto');
const Star = require('../models/Star');

router.get('/', csrfProtection, (req, res, next) => {
  Promise.all([getThemes(), getHitikotos(req.user)]).then((datas) => {
    res.render('index', {
      title: "HitoKoto",
      user: req.user,
      themes: datas[0],
      hitokotos: datas[1],
      csrfToken: req.csrfToken()
    });
  });
});

function getThemes() {
  return Theme.findAll({
    include: [{ model: User, attributes: ['user_id', 'username'] }],
    where: { state: 0 },
    order: [['createdAt', 'DESC']]
  });
}

function getHitikotos(user) {
  const hitokotoQuery = {
    include: [
      { model: User, attributes: ['user_id', 'username'] },
      { model: Theme, attributes: ['theme_id', 'theme'] }
    ],
    where: { state: 0 },
    order: [['createdAt', 'DESC']]
  }
  if (user) {
    hitokotoQuery.include.push({
      model: Star, 
      attributes: ['hitokoto_id', 'user_id', 'stared'],
      where: {'user_id': user.id,},
      required: false
    });
  }
  return Hitokoto.findAll(hitokotoQuery);
}

module.exports = router;
