'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('./authentication-ensurer');
const uuid = require('uuid');
const User = require('../models/User');
const Theme = require('../models/Theme');
const Hitokoto = require('../models/Hitokoto');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

router.post('/', authenticationEnsurer, csrfProtection, (req, res, next) => {
  const hitokoto = {
    hitokoto_id: uuid.v4(),
    hitokoto: req.body.hitokoto.slice(0, 255) || '（名称未設定）',
    theme_id: req.body.theme_id,
    user_id: req.user.id, 
    state: 0
  }
  console.log(JSON.stringify(hitokoto));
  Hitokoto.create(hitokoto).then(() => {
    res.redirect('/');
  });
});

module.exports = router;
