'use strict';
const request = require('supertest');
process.env.GITHUB_CLIENT_ID = 'dummy';
process.env.GITHUB_CLIENT_SECRET = 'dummy';
const $ = require('jquery');
const app = require('../app');
const passportStub = require('passport-stub');
const User = require('../models/User');
const Theme = require('../models/Theme');
const Hitokoto = require('../models/Hitokoto');
const Star = require('../models/Star');

// csrfトークンの取得（ログインが必要）
const getCsrfToken = html => $(html).find('input[name=_csrf]').val();

describe('共通表示', () => {

  test('非ログイン時、ログインボタンが表示される', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/<a class="btn btn-info" href="\/auth\/github"/);
  });

  test('フッターが表示される', async () => {
    const res = await request(app).get('/');
    expect(res.text).toMatch(/footer/);
  });
});

describe('login', () => {

  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  test('ログイン後、ユーザー名が表示される', async () => {
    await User.upsert({ user_id: 0, username: 'testuser' });
    const res = await request(app).get('/');
    expect(res.text).toMatch(/testuser/);
  });

  test('ログイン後、ログアウトができる', async () => {
    await User.upsert({ user_id: 0, username: 'testuser' });
    const res = await request(app).get('/logout');
    expect(res.status).toBe(302);
    expect(res.header['location']).toBe('/');
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });
});

describe('テーマ：非ログイン時', () => {

  test('テーマ一覧が新着順で表示される', async () => {
    await User.upsert({ user_id: 0, username: 'testuser' });
    await Theme.upsert({ theme: 'TestTheme_テーマ一覧が新着順で表示される1', user_id: 0, });
    await Theme.upsert({ theme: 'TestTheme_テーマ一覧が新着順で表示される2', user_id: 0, });
    
    // テーマ一覧が新着順で表示される
    const res = await request(app).get('/');
    expect(res.text).toMatch(/TestTheme_テーマ一覧が新着順で表示される/);
    const firstPostIndex = res.text.indexOf('TestTheme_テーマ一覧が新着順で表示される1');
    const secondPostIndex = res.text.indexOf('TestTheme_テーマ一覧が新着順で表示される2');
    expect(secondPostIndex).toBeLessThan(firstPostIndex);

    Theme.destroy({ where : { theme: "TestTheme_テーマ一覧が新着順で表示される" }});
  });

  test('テーマを作るボタンが表示されない', async () => {
    const res = await request(app).get('/');
    expect(res.text).not.toMatch(/themeInputSwitch/);
  });

  test('テーマが投稿できない', async () => {

    // POSTリクエスト（CSRFで弾かれる）
    const resPostTheme = await request(app)
      .post('/theme')
      .send({ theme: 'TestTheme_テーマが投稿できない' });
    expect(resPostTheme.status).toBe(302);
    expect(resPostTheme.header['location']).toBe('/auth/github');
    
    // 投稿されていない
    const resRoot = await request(app).get('/');
    expect(resRoot.text).not.toMatch(/TestTheme_テーマが投稿できない/);
  });

  test('テーマが削除できない', async () => {
    await User.upsert({ user_id: 0, username: 'testuser' })
    const theme = await Theme.create({ theme: 'TestTheme_テーマが削除できない', user_id: 0, });

    // 削除リクエスト（CSRFで弾かれる）
    const resDeleteTheme = await request(app)
      .delete('/theme/' + theme.theme_id);
    expect(resDeleteTheme.status).toBe(302);
    expect(resDeleteTheme.header['location']).toBe('/auth/github');
    
    // 削除されていない
    const resRoot = await request(app).get('/');
    expect(resRoot.text).toMatch(/TestTheme_テーマが削除できない/);
    
    await Theme.destroy({ where : { theme: "TestTheme_テーマが削除できない" }});
  });
});

describe('テーマ：ログイン時', () => {

  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  test('テーマ投稿フォームが表示される', async () => {
    await User.upsert({ user_id: 0, username: 'testuser' });
    const res = await request(app).get('/');
    expect(res.text).toMatch(/themeInputSwitch/);
  });

  test('テーマが投稿できる', async () => {
    await User.upsert({ user_id: 0, username: 'testuser' });
    const resCsrfSrc = await request(app).get('/');

    // POSTリクエスト
    const resPostTheme = await request(app)
      .post('/theme')
      .set('cookie', resCsrfSrc.headers['set-cookie'])
      .send({ theme: 'TestTheme_テーマが投稿できる', _csrf: getCsrfToken(resCsrfSrc.text) });
    expect(resPostTheme.status).toBe(302);
    expect(resPostTheme.header["location"]).toBe('/');

    // 投稿されたテーマを確認
    const resRoot = await request(app).get('/');
    expect(resRoot.text).toMatch(/TestTheme_テーマが投稿できる/);

    await Theme.destroy({ where : { theme: "TestTheme_テーマが投稿できる" }});
  });
  
  test('自分がオーナーのテーマが削除できる', async () => {
    await User.upsert({ user_id: 0, username: 'testuser' });
    const theme = await Theme.create({ theme: 'TestTheme_自分がオーナーのテーマが削除できる', user_id: 0 });
    const resCsrfSrc = await request(app).get('/');
    
    // 削除リクエスト
    const resDeleteTheme = await request(app)
      .delete('/theme/' + theme.theme_id)
      .set('cookie', resCsrfSrc.headers['set-cookie'])
      .send({ _csrf: getCsrfToken(resCsrfSrc.text) })
    expect(resDeleteTheme.text).toBe('["success"]');
    
    // データが消えている
    const resRoot = await request(app).get('/');
    expect(resRoot.text).not.toMatch(/TestTheme_自分がオーナーのテーマが削除できる/);

    await Theme.destroy({ where : { theme: "TestTheme_自分がオーナーのテーマが削除できる" }});
  });
  
  test('自分がオーナーでないテーマは削除できない', async () => {
      await User.upsert({ user_id: 0, username: 'testuser' });
      await User.upsert({ user_id: 1, username: 'testuser' });
      const theme = await Theme.create({ theme: 'TestTheme_自分がオーナーでないテーマは削除できない', user_id: 1 });
      const resCsrfSrc = await request(app).get('/');
      
      // 削除リクエスト（０件で更新するので成功扱い）
      const resDeleteTheme = await request(app)
        .delete('/theme/' + theme.theme_id)
        .set('cookie', resCsrfSrc.headers['set-cookie'])
        .send({ _csrf: getCsrfToken(resCsrfSrc.text) });
      expect(resDeleteTheme.text).toBe('["success"]');

      // データが消えていない
      const resRoot = await request(app).get('/');
      expect(resRoot.text).toMatch(/自分がオーナーでないテーマは削除できない/);
      
      await Theme.destroy({ where : { theme: "TestTheme_自分がオーナーでないテーマは削除できない" }});
  });
  
  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });
});

describe('HitoKoto：非ログイン時', () => {
  
  test('HitoKotoが新着順で表示される', async () => {
    await User.upsert({ user_id: 0, username: 'testuser' });
    const theme = await Theme.create({ theme: 'TestTheme_HitoKotoが新着順で表示される', user_id: 0, });
    await Hitokoto.upsert({ hitokoto: 'TestHitokoto_HitoKotoが新着順で表示される1', theme_id: theme.theme_id, user_id: 0, });
    await Hitokoto.upsert({ hitokoto: 'TestHitokoto_HitoKotoが新着順で表示される2', theme_id: theme.theme_id, user_id: 0, });

    // HitoKotoが新着順で表示される
    const res = await request(app).get('/');
    expect(res.text).toMatch(/TestHitokoto/);
    const firstPostIndex = res.text.indexOf('TestHitokoto_HitoKotoが新着順で表示される1');
    const secondPostIndex = res.text.indexOf('TestHitokoto_HitoKotoが新着順で表示される2');
    expect(secondPostIndex).toBeLessThan(firstPostIndex);

    await Hitokoto.destroy({ where : { hitokoto: "TestHitokoto_HitoKotoが新着順で表示される1" }});
    await Hitokoto.destroy({ where : { hitokoto: "TestHitokoto_HitoKotoが新着順で表示される2" }});
    await Theme.destroy({ where : { theme: "TestTheme_HitoKotoが新着順で表示される" }});
  });

  test('HitoKoto投稿フォームが非表示になる', async () => {
    await User.upsert({ user_id: 0, username: 'testuser' });
    await Theme.create({ theme: 'TestTheme_HitoKoto投稿フォームが非表示になる', user_id: 0, });

    // HitoKoto投稿フォームが非表示になる
    const res = await request(app).get('/');
    expect(res.text).not.toMatch(/createHitokoto/);

    await Theme.destroy({ where : { theme: "TestTheme_HitoKoto投稿フォームが非表示になる" }});
  });
  
  test('HitoKotoが投稿できない', async () => {
    await User.upsert({ user_id: 0, username: 'testuser' });
    const theme = await Theme.create({ theme: 'TestTheme_HitoKotoが投稿できない', user_id: 0, });
    
    // POSTリクエスト（CSRFで弾かれる）
    const resPostHitokoto = await request(app)
      .post('/theme/' + theme.theme_id + '/hitokoto')
      .send({ theme: 'TestHitoKoto_HitoKotoが投稿できない' });
    expect(resPostHitokoto.status).toBe(302);
    expect(resPostHitokoto.header['location']).toBe('/auth/github');
    
    // 投稿されていない
    const resRoot = await request(app).get('/');
    expect(resRoot.text).not.toMatch(/TestHitoKoto_HitoKotoが投稿できない/);

    await Theme.destroy({ where : { theme: "TestTheme_HitoKotoが投稿できない" }});
  });
});

describe('HitoKoto：ログイン時', () => {

  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  test('HitoKoto投稿フォームが表示される', async () => {
    await User.upsert({ user_id: 0, username: 'testuser' });
    const res = await request(app).get('/');
    expect(res.text).toMatch(/createHitokoto/);
  });

  test('HitoKotoが投稿できる', async () => {
    await User.upsert({ user_id: 0, username: 'testuser' });
    const theme = await Theme.create({ theme: 'TestTheme_HitoKotoが投稿できる', user_id: 0, });
    const resCsrfSrc = await request(app).get('/');

    // POSTリクエスト
    const resPostTheme = await request(app)
      .post('/theme/' + theme.theme_id + '/hitokoto')
      .set('cookie', resCsrfSrc.headers['set-cookie'])
      .send({ hitokoto: 'TestHitoKoto_HitoKotoが投稿できる', _csrf: getCsrfToken(resCsrfSrc.text) });
    expect(resPostTheme.status).toBe(200);
    expect(resPostTheme.body.hitokoto).toBe('TestHitoKoto_HitoKotoが投稿できる');
    expect(resPostTheme.body.star_count).toBe(0);

    // 投稿されたテーマを確認
    const resRoot = await request(app).get('/');
    expect(resRoot.text).toMatch(/TestHitoKoto_HitoKotoが投稿できる/);

    await Hitokoto.destroy({ where : { hitokoto: "TestHitoKoto_HitoKotoが投稿できる" }});
    await Theme.destroy({ where : { theme: "TestTheme_テーマが投稿できる" }});
  });

  test('自分がオーナーであるHitoKotoが削除できる', async () => {
    await User.upsert({ user_id: 0, username: 'testuser' });
    const theme = await Theme.create({ theme: 'TestTheme_自分がオーナーであるHitoKotoが削除できる', user_id: 0 });
    const hitokoto = await Hitokoto.create({ hitokoto: 'TestHitokoto_自分がオーナーであるHitoKotoが削除できる', theme_id: theme.theme_id, user_id: 0, });
    const resCsrfSrc = await request(app).get('/');
    
    // 削除リクエスト
    const resDeleteHitokoto = await request(app)
      .delete('/hitokoto/' + hitokoto.hitokoto_id)
      .set('cookie', resCsrfSrc.headers['set-cookie'])
      .send({ _csrf: getCsrfToken(resCsrfSrc.text) })
    expect(resDeleteHitokoto.text).toBe('["success"]');
    
    // データが消えている
    const resRoot = await request(app).get('/');
    expect(resRoot.text).not.toMatch(/TestHitokoto_自分がオーナーであるHitoKotoが削除できる/);

    await Hitokoto.destroy({ where : { hitokoto: "TestHitokoto_自分がオーナーであるHitoKotoが削除できる" }});
    await Theme.destroy({ where : { theme: "TestTheme_自分がオーナーであるHitoKotoが削除できる" }});
  });

  test('自分がオーナーでないHitoKotoは削除できない', async () => {
    await User.upsert({ user_id: 0, username: 'testuser1' });
    await User.upsert({ user_id: 1, username: 'testuser2' });
    const theme = await Theme.create({ theme: 'TestTheme_自分がオーナーであるHitoKotoが削除できる', user_id: 1 });
    const hitokoto = await Hitokoto.create({ hitokoto: 'TestHitokoto_自分がオーナーであるHitoKotoが削除できる', theme_id: theme.theme_id, user_id: 1, });
    const resCsrfSrc = await request(app).get('/');
    
    // 削除リクエスト０件で成功
    const resDeleteHitokoto = await request(app)
      .delete('/hitokoto/' + hitokoto.hitokoto_id)
      .set('cookie', resCsrfSrc.headers['set-cookie'])
      .send({ _csrf: getCsrfToken(resCsrfSrc.text) })
    expect(resDeleteHitokoto.text).toBe('["success"]');
    
    // データが残っている
    const resRoot = await request(app).get('/');
    expect(resRoot.text).toMatch(/TestHitokoto_自分がオーナーであるHitoKotoが削除できる/);

    await Hitokoto.destroy({ where : { hitokoto: "TestHitokoto_自分がオーナーであるHitoKotoが削除できる" }});
    await Theme.destroy({ where : { theme: "TestTheme_自分がオーナーであるHitoKotoが削除できる" }});
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });
});

describe('いいね：非ログイン時', () => {
  
  test('HitoKotoにいいねが押せない', async () => {
    await User.upsert({ user_id: 0, username: 'testuser' });
    const theme = await Theme.create({ theme: 'TestTheme_HitoKotoにいいねが押せない', user_id: 0 });
    const hitokoto = await Hitokoto.create({ hitokoto: 'TestHitokoto_HitoKotoにいいねが押せない', theme_id: theme.theme_id, user_id: 0, });

    // いいねができる
    const resPostStar = await request(app)
      .post(`/hitokoto/${hitokoto.hitokoto_id}/star`)
      .send({ stared: 1 });
    expect(resPostStar.status).toBe(302);
    expect(resPostStar.header["location"]).toBe('/auth/github');

    // いいねが追加されていない
    const resRoot = await request(app).get('/');
    expect($(resRoot.text).find(`#Stars_${hitokoto.hitokoto_id}`).text()).toBe(" 0");

    await Hitokoto.destroy({ where : { hitokoto: "TestHitokoto_HitoKotoにいいねが押せない" }});
    await Theme.destroy({ where : { theme: "TestTheme_HitoKotoにいいねが押せない" }});
  });
});

describe('いいね：ログイン時', () => {

  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  test('HitoKotoにいいねができる', async () => {
    await User.upsert({ user_id: 0, username: 'testuser' });
    const theme = await Theme.create({ theme: 'TestTheme_HitoKotoにいいねができる', user_id: 0 });
    const hitokoto = await Hitokoto.create({ hitokoto: 'TestHitokoto_HitoKotoにいいねができる', theme_id: theme.theme_id, user_id: 0, });
    const resCsrfSrc = await request(app).get('/');

    // いいねができる
    const resPostStar = await request(app)
      .post(`/hitokoto/${hitokoto.hitokoto_id}/star`)
      .set('cookie', resCsrfSrc.headers['set-cookie'])
      .send({ stared: 0, _csrf: getCsrfToken(resCsrfSrc.text) });
    expect(resPostStar.status).toBe(200);
    expect(resPostStar.body.stared).toBe(1);
    expect(resPostStar.body.starCount).toBe(1);

    // いいねが確認できる
    const resRoot = await request(app).get('/');
    expect($(resRoot.text).find(`#Stars_${hitokoto.hitokoto_id}`).text()).toBe(" 1");

    await Star.destroy({ where : { hitokoto_id: hitokoto.hitokoto_id }});
    await Hitokoto.destroy({ where : { hitokoto: "TestHitokoto_HitoKotoにいいねができる" }});
    await Theme.destroy({ where : { theme: "TestTheme_HitoKotoにいいねができる" }});
  });
  
  test('いいねを取り消すことができる', async () => {
    await User.upsert({ user_id: 0, username: 'testuser' });
    const theme = await Theme.create({ theme: 'TestTheme_いいねを取り消すことができる', user_id: 0 });
    const hitokoto = await Hitokoto.create({ hitokoto: 'TestHitokoto_いいねを取り消すことができる', theme_id: theme.theme_id, user_id: 0, });
    const resCsrfSrc = await request(app).get('/');

    // いいねができる
    const resPostStar = await request(app)
      .post(`/hitokoto/${hitokoto.hitokoto_id}/star`)
      .set('cookie', resCsrfSrc.headers['set-cookie'])
      .send({ stared: 1, _csrf: getCsrfToken(resCsrfSrc.text) });
    expect(resPostStar.status).toBe(200);
    expect(resPostStar.body.stared).toBe(0);
    expect(resPostStar.body.starCount).toBe(0);

    // いいねが確認できる
    const resRoot = await request(app).get('/');
    expect($(resRoot.text).find(`#Stars_${hitokoto.hitokoto_id}`).text()).toBe(" 0");

    await Star.destroy({ where : { hitokoto_id: hitokoto.hitokoto_id }});
    await Hitokoto.destroy({ where : { hitokoto: "TestHitokoto_いいねを取り消すことができる" }});
    await Theme.destroy({ where : { theme: "TestTheme_いいねを取り消すことができる" }});
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });
});