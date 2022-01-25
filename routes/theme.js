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
  const theme = {
    theme_id: uuid.v4(),
    user_id: req.user.id,
    theme: req.body.theme.slice(0, 255) || '（名称未設定）',
  }
  Theme.create(theme).then(() => {
    res.redirect('/');
  });
});

router.post('/:theme_id/hitokoto', authenticationEnsurer, csrfProtection, (req, res, next) => {
  const hitokoto = {
    hitokoto_id: uuid.v4(),
    hitokoto: req.body.hitokoto.slice(0, 255) || '（名称未設定）',
    theme_id: req.params.theme_id,
    user_id: req.user.id
  }
  Hitokoto.create(hitokoto).then((hitokoto) => {
    Hitokoto.findOne({
      include: [
        { model: User, attributes: ['user_id', 'username'] },
        { model: Theme, attributes: ['theme_id', 'theme'] }],
      where: { hitokoto_id: hitokoto.hitokoto_id }
    }).then((hitokoto) => {
      res.json(hitokoto);
    });
  });
});

router.delete('/:id', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Theme.update(
    { state: 1 },
    { where: { theme_id: req.params.id }}
  ).then((theme) => {
    res.json(['success']);
  });
});

module.exports = router;
