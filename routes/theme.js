'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('../lib/authenticationEnsurer');
const User = require('../models/User');
const Theme = require('../models/Theme');
const Hitokoto = require('../models/Hitokoto');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

/**
 * テーマ投稿
 */
router.post('/', authenticationEnsurer, csrfProtection, (req, res, next) => {

  // 内容が空の場合は処理しない
  if(!req.body.theme.trim()) {
    res.redirect('/');
    return;
  }

  const theme = {
    user_id: req.user.id,
    theme: req.body.theme.slice(0, 50),
  }
  Theme.create(theme).then(() => {
    res.redirect('/');
  });
});

/**
 * 指定のテーマにHitoKotoを投稿
 */
router.post('/:theme_id/hitokoto', authenticationEnsurer, csrfProtection, (req, res, next) => {
  
  // 内容が空の場合は処理しない
  if(!req.body.hitokoto.trim()) {
    res.redirect('/');
    return;
  }

  const hitokoto = {
    hitokoto: req.body.hitokoto.slice(0, 255),
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

/**
 * テーマ削除
 */
router.delete('/:id', authenticationEnsurer, csrfProtection, (req, res, next) => {
  Theme.update(
    { state: 1 },
    { where: { theme_id: req.params.id, user_id: req.user.id}}
  ).then((theme) => {
    res.json(['success']);
  });
});

module.exports = router;
