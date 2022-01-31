'use strict';
const express = require('express');
const router = express.Router();
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const User = require('../models/User');
const Theme = require('../models/Theme');
const Hitokoto = require('../models/Hitokoto');
const Star = require('../models/Star');

/**
 * TOP ページ
 */
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

/**
 * テーマ一覧の取得
 * @returns テーマ一覧
 */
function getThemes() {
  return Theme.findAll({
    include: [{ model: User, attributes: ['user_id', 'username'] }],
    where: { state: 0 },
    order: [['createdAt', 'DESC']]
  });
}

/**
 * Hitokoto一覧の取得
 * ログイン済みの場合はいいね済みかどうかのデータも含める
 * @returns Hitokoto一覧
 */
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
    // いいね済みのデータを取得
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
