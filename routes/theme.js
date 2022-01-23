'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('uuid');
const User = require('../models/User');
const Theme = require('../models/Theme');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

router.post('/', authenticationEnsurer, csrfProtection, (req, res, next) => {
  const theme = {
    theme_id: uuid.v4(),
    user_id: req.user.id, 
    theme: req.body.theme.slice(0, 255) || '（名称未設定）',
    state: 0
  }
  Theme.create(theme).then(() => {
    res.redirect('/');
  });
});

module.exports = router;
