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

/* GET home page. */
router.get('/', csrfProtection, (req, res, next) => {
  const title = 'HitoKoto';
  if (req.user) {
    const themePromise = Theme.findAll({
      include: [
        { model: User, attributes: ['user_id', 'username'] },
      ],
      where: { state: 0 },
      order: [['createdAt', 'DESC']]
    });
    const hitokotoPromise = Hitokoto.findAll({
      include: [
        { model: User, attributes: ['user_id', 'username'] },
        { model: Theme, attributes: ['theme_id', 'theme'] },
        { model: Star, 
          attributes: ['hitokoto_id', 'user_id', 'stared'],
          where: {'user_id': req.user.id,},
          required: false
        }
      ],
      where: { state: 0 },
      order: [['createdAt', 'DESC']]
    });

    Promise.all([themePromise, hitokotoPromise]).then((datas) => {
      res.render('index', {
        title: title,
        user: req.user,
        themes: datas[0],
        hitokotos: datas[1],
        csrfToken: req.csrfToken()
      });
    });

  } else {
    res.render('index', { title: title, user: req.user });
  }
});

module.exports = router;
