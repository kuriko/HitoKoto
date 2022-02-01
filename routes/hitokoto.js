'use strict';
const express = require('express');
const router = express.Router();
const authenticationEnsurer = require('../lib/authenticationEnsurer');
const Hitokoto = require('../models/Hitokoto');
const Star = require('../models/Star');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

/**
 * 指定のHitoKotoにいいねをつける
 */
router.post('/:hitokoto_id/star', authenticationEnsurer, csrfProtection, (req, res, next) => {
  const hitokoto_id = Number(req.params.hitokoto_id);
  if (!hitokoto_id) {
    res.json([['Bad Request']]);
    return;
  }
  const resJson = {};
  Star.upsert({
    hitokoto_id,
    user_id: req.user.id,
    stared: Number(req.body.stared) === 1 ? 0 : 1
  }).then((stars) => {
    resJson.stared = stars[0].stared;
    return Star.sum('stared', { where: { hitokoto_id }});
  }).then((starCount) => {
    resJson.starCount = starCount;
    return Hitokoto.update({ star_count: starCount }, { where: { hitokoto_id }});
  }).then(() => {
    res.json(resJson);
  });
});

/**
 * 指定のHitoKotoを削除
 */
router.delete('/:hitokoto_id', authenticationEnsurer, csrfProtection, (req, res, next) => {
  const hitokoto_id = Number(req.params.hitokoto_id);
  if (!hitokoto_id) {
    res.json([['Bad Request']]);
    return;
  }
  Hitokoto.update(
    { state: 1 },
    { where: { hitokoto_id, user_id: req.user.id}}
  ).then((hitokoto) => {
    res.json(['success']);
  });
});

module.exports = router;
