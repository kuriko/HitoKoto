'use strict';
const express = require('express');
const router = express.Router();
const Theme = require('../models/Theme');
const moment = require('moment-timezone');

/* GET home page. */
router.get('/', (req, res, next) => {
  const title = 'HitoKoto';
  if (req.user) {
    Theme.findAll({
      where: {
        createdBy: req.user.id
      },
      order: [['updatedAt', 'DESC']]
    }).then((themes) => {
      themes.forEach((theme) => {
        theme.formattedUpdatedAt = moment(theme.updatedAt).tz('Asia/Tokyo').format('YYYY/MM/DD HH:mm');
      });
      res.render('index', {
        title: title,
        user: req.user,
        themes: themes
      });
    });
  } else {
    res.render('index', { title: title, user: req.user });
  }
});

module.exports = router;
