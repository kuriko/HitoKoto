'use strict';
const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const User = require('../models/User');
const Theme = require('../models/Theme');
const Hitokoto = require('../models/Hitokoto');

/* GET home page. */
router.get('/', csrfProtection, (req, res, next) => {
  const title = 'HitoKoto';
  if (req.user) {
    const themePromise = Theme.findAll({});
    const hitokotoPromise = Hitokoto.findAll({
      include: [
        {
          model: User,
          attributes: ['user_id', 'username']
        },
        {
          model: Theme,
          attributes: ['theme_id', 'theme']
        },],
      order: [['updatedAt', 'DESC']]
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
