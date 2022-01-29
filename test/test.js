'use strict';
const request = require('supertest');
process.env.GITHUB_CLIENT_ID = 'dummy';
process.env.GITHUB_CLIENT_SECRET = 'dummy';
const app = require('../app');
const passportStub = require('passport-stub');
const User = require('../models/User');
const Theme = require('../models/Theme');

describe('共通表示', () => {

  test('非ログイン時、ログインボタンが表示される', () => {
    return request(app)
      .get('/')
      .expect(/<a class="btn btn-info" href="\/auth\/github"/)
      .expect(200);
  });

  test('フッターが表示される', () => {
  });
});

describe('login', () => {

  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  test('ログイン後、ユーザー名が表示される', () => {
    return User.upsert({ user_id: 0, username: 'testuser' }).then(() => {
      request(app)
        .get('/')
        .expect(/testuser/)
        .expect(200);
    });
  });

  test('ログイン後、ログアウトができる', () => {
    return User.upsert({ user_id: 0, username: 'testuser' }).then(() => {
      request(app)
        .get('/logout')
        .expect('Location', '/')
        .expect(302);
    });
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });
});

describe('テーマ：非ログイン時', () => {

  test('テーマ一覧が新着順で表示される', () => {
    return User.upsert({ user_id: 0, username: 'testuser' }).then(() => {
      Theme.upsert({ theme: 'TestTheme', user_id: 0, }).then(() => {
        request(app)
          .get('/')
          .expect(/<h5 class="card-title m-2">TestTheme/)
          .expect(200);
      });
    });
  });

  test('テーマを作るボタンが表示されない', () => {
    return request(app)
      .get('/')
      .expect(/^(?!.*themeInputSwitch).*$/)
      .expect(200);
  });

  test('テーマが投稿できない', (done) => {
    return request(app)
      .post('/theme')
      .send({ theme: 'TestTheme_テーマが投稿できない' })
      .expect('Location', '/auth/github')
      .expect(302)
      .end((err, res) => {
        request(app)
          .post('/')
          .expect(/^(?!.*TestTheme_テーマが投稿できない).*$/)
          .expect(200)
          .end(() => {
            done();
          });
      });
  });

  test('テーマが削除できない', (done) => {
    return User.upsert({ user_id: 0, username: 'testuser' }).then(() => {
      Theme.upsert({ theme: 'TestTheme_テーマが削除できない', user_id: 0, }).then(() => {
        request(app)
          .delete('/theme/1')
          .expect('Location', '/auth/github')
          .expect(302)
          .end((err, res) => {
            request(app)
              .post('/')
              .expect(/TestTheme_テーマが削除できない/)
              .expect(200)
              .end((err, res) => {
                Theme.destroy({ where : { theme: "TestTheme_テーマが削除できない" }}).then(() => {
                  done();
                });
              });
          });
      });
    });
  });
});

describe('テーマ：ログイン時', () => {

  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  test('テーマ投稿フォームが表示される', () => {
    return User.upsert({ user_id: 0, username: 'testuser' }).then(() => {
      return request(app)
        .get('/')
        .expect(/themeInputSwitch/)
        .expect(200);
    });
  });

  test('テーマが投稿できる', (done) => {
    return User.upsert({ user_id: 0, username: 'testuser' }).then(() => {
      request(app)
        .post('/theme')
        .send({ theme: 'TestTheme_テーマが投稿できる' })
        .expect('Location', '/')
        .expect(302)
        .end((err, res) => {
          request(app)
            .post('/')
            .expect(/TestTheme_テーマが投稿できる/)
            .expect(200)
            .end((err, res) => {
              Theme.destroy({ where : { theme: "TestTheme_テーマが投稿できる" }}).then(() => {
                done();
              });
            });
        });
    });
  });
  
  test('自分がオーナーのテーマが削除できる', (done) => {
    return User.upsert({ user_id: 0, username: 'testuser' }).then(() => {
      Theme.upsert({ theme: 'TestTheme_自分がオーナーのテーマが削除できる', user_id: 0 }).then(() => {
        Theme.findOne({ where: { theme: 'TestTheme_自分がオーナーのテーマが削除できる' }}).then((theme) => {
          request(app)
            .delete('/theme/' + theme.theme_id)
            .expect('Location', '/')
            .expect(302)
            .end((err, res) => {
              request(app)
                .post('/')
                .expect(/^(?!.*TestTheme_自分がオーナーのテーマが削除できる).*$/)
                .expect(200)
                .end((err, res) => {
                  Theme.destroy({ where : { theme: "TestTheme_自分がオーナーのテーマが削除できる" }}).then(() => {
                    done();
                  });
                });
            });
          });
        });
    });
  });
  
  test('自分がオーナーでないテーマは削除できない', () => {
    return User.upsert({ user_id: 0, username: 'testuser' }).then(() => {
      Theme.upsert({ theme: 'TestTheme_自分がオーナーでないテーマは削除できない', user_id: 1 }).then(() => {
        Theme.findOne({ where: { theme: '自分がオーナーでないテーマは削除できない' }}).then((theme) => {
          request(app)
            .delete('/theme/' + theme.theme_id)
            .expect('Location', '/')
            .expect(302)
            .end((err, res) => {
              request(app)
                .post('/')
                .expect(/自分がオーナーでないテーマは削除できない/)
                .expect(200)
                .end((err, res) => {
                  Theme.destroy({ where : { theme: "TestTheme_自分がオーナーでないテーマは削除できない" }}).then(() => {
                    done();
                  });
                });
            });
          });
        });
    });
  });
  
  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });
});

/**
describe('HitoKoto', () => {
  
  test('HitoKotoが新着順で表示される', () => {
  });

  test('ログインしていない場合、HitoKoto投稿フォームが非表示になる', () => {
  });

  test('ログインしている場合、HitoKoto投稿フォームが表示される', () => {
  });
  
  test('ログインしていない場合、HitoKotoが投稿できない', () => {
  });

  test('ログインしている場合、HitoKotoが投稿できる', () => {
  });
  
  test('HitoKotoが投稿後、非同期で投稿したHitoKotoが表示される', () => {
  });

  test('HitoKoto投稿後にフォームの内容がクリアされる', () => {
  });

  test('自分がオーナーであるHitoKotoが削除できる', () => {
  });

  test('自分がオーナーでないHitoKotoは削除できない', () => {
  });
  
  test('HitoKoto投稿後に非同期で追加されたHitoKotoが削除できる', () => {
  });
});

describe('いいね', () => {

  test('非同期でHitoKotoにいいねができる', () => {
  });
  
  test('いいね済みのStarのテキストカラーが青色になる', () => {
  });
  
  test('HitoKoto投稿後に非同期で追加されたHitoKotoにいいねができる', () => {
  });
  
  test('いいねを取り消すことができる', () => {
  });

  test('いいねをした直後のHitoKotoのいいねを取り消すことができる', () => {
  });
  
  test('いいねを取り消したStarのテキストカラーは灰色となる', () => {
  });
  
  test('HitoKotoにいいねが押せない', () => {
  });

});


describe('/schedules', () => {
  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  test('予定が作成でき、表示される', (done) => {
    User.upsert({ userId: 0, username: 'testuser' }).then(() => {
      request(app)
        .post('/schedules')
        .send({ scheduleName: 'テスト予定1', memo: 'テストメモ1\r\nテストメモ2', candidates: 'テスト候補1\r\nテスト候補2\r\nテスト候補3' })
        .expect('Location', /schedules/)
        .expect(302)
        .end((err, res) => {
          const createdSchedulePath = res.headers.location;
          request(app)
            .get(createdSchedulePath)
            .expect(/テスト予定1/)
            .expect(/テストメモ1/)
            .expect(/テストメモ2/)
            .expect(/テスト候補1/)
            .expect(/テスト候補2/)
            .expect(/テスト候補3/)
            .expect(200)
            .end((err, res) => { deleteScheduleAggregate(createdSchedulePath.split('/schedules/')[1], done, err); });
        });
    });
  });
});

describe('/schedules/:scheduleId/users/:userId/candidates/:candidateId', () => {
  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  test('出欠が更新できる', (done) => {
    User.upsert({ userId: 0, username: 'testuser' }).then(() => {
      request(app)
        .post('/schedules')
        .send({ scheduleName: 'テスト出欠更新予定1', memo: 'テスト出欠更新メモ1', candidates: 'テスト出欠更新候補1' })
        .end((err, res) => {
          const createdSchedulePath = res.headers.location;
          const scheduleId = createdSchedulePath.split('/schedules/')[1];
          Candidate.findOne({
            where: { scheduleId: scheduleId }
          }).then((candidate) => {
            // 更新がされることをテスト
            const userId = 0;
            request(app)
              .post(`/schedules/${scheduleId}/users/${userId}/candidates/${candidate.candidateId}`)
              .send({ availability: 2 }) // 出席に更新
              .expect('{"status":"OK","availability":2}')
              .end((err, res) => {
                Availability.findAll({
                  where: { scheduleId: scheduleId }
                }).then((availabilities) => {
                  assert.strictEqual(availabilities.length, 1);
                  assert.strictEqual(availabilities[0].availability, 2);
                  deleteScheduleAggregate(scheduleId, done, err);
                });
              });
          });
        });
    });
  });
});

describe('/schedules/:scheduleId/users/:userId/comments', () => {
  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  test('コメントが更新できる', (done) => {
    User.upsert({ userId: 0, username: 'testuser' }).then(() => {
      request(app)
        .post('/schedules')
        .send({ scheduleName: 'テストコメント更新予定1', memo: 'テストコメント更新メモ1', candidates: 'テストコメント更新候補1' })
        .end((err, res) => {
          const createdSchedulePath = res.headers.location;
          const scheduleId = createdSchedulePath.split('/schedules/')[1];
          // 更新がされることをテスト
          const userId = 0;
          request(app)
            .post(`/schedules/${scheduleId}/users/${userId}/comments`)
            .send({ comment: 'testcomment' })
            .expect('{"status":"OK","comment":"testcomment"}')
            .end((err, res) => {
              Comment.findAll({
                where: { scheduleId: scheduleId }
              }).then((comments) => {
                assert.strictEqual(comments.length, 1);
                assert.strictEqual(comments[0].comment, 'testcomment');
                deleteScheduleAggregate(scheduleId, done, err);
              });
            });
        });
    });
  });
});


describe('/schedules/:scheduleId?edit=1', () => {
  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  test('予定が更新でき、候補が追加できる', (done) => {
    User.upsert({ userId: 0, username: 'testuser' }).then(() => {
      request(app)
        .post('/schedules')
        .send({ scheduleName: 'テスト更新予定1', memo: 'テスト更新メモ1', candidates: 'テスト更新候補1' })
        .end((err, res) => {
          const createdSchedulePath = res.headers.location;
          const scheduleId = createdSchedulePath.split('/schedules/')[1];
          // 更新がされることをテスト
          request(app)
            .post(`/schedules/${scheduleId}?edit=1`)
            .send({ scheduleName: 'テスト更新予定2', memo: 'テスト更新メモ2', candidates: 'テスト更新候補2' })
            .end((err, res) => {
              Schedule.findByPk(scheduleId).then((s) => {
                assert.strictEqual(s.scheduleName, 'テスト更新予定2');
                assert.strictEqual(s.memo, 'テスト更新メモ2');
              });
              Candidate.findAll({
                where: { scheduleId: scheduleId },
                order: [['candidateId', 'ASC']]
              }).then((candidates) => {
                assert.strictEqual(candidates.length, 2);
                assert.strictEqual(candidates[0].candidateName, 'テスト更新候補1');
                assert.strictEqual(candidates[1].candidateName, 'テスト更新候補2');
                deleteScheduleAggregate(scheduleId, done, err);
              });
            });
        });
    });
  });
});

describe('/schedules/:scheduleId?delete=1', () => {
  beforeAll(() => {
    passportStub.install(app);
    passportStub.login({ id: 0, username: 'testuser' });
  });

  afterAll(() => {
    passportStub.logout();
    passportStub.uninstall(app);
  });

  test('予定に関連する全ての情報が削除できる', (done) => {
    User.upsert({ userId: 0, username: 'testuser' }).then(() => {
      request(app)
        .post('/schedules')
        .send({ scheduleName: 'テスト更新予定1', memo: 'テスト更新メモ1', candidates: 'テスト更新候補1' })
        .end((err, res) => {
          const createdSchedulePath = res.headers.location;
          const scheduleId = createdSchedulePath.split('/schedules/')[1];

          // 出欠作成
          const promiseAvailability = Candidate.findOne({
            where: { scheduleId: scheduleId }
          }).then((candidate) => {
            return new Promise((resolve) => {
              const userId = 0;
              request(app)
                .post(`/schedules/${scheduleId}/users/${userId}/candidates/${candidate.candidateId}`)
                .send({ availability: 2 }) // 出席に更新
                .end((err, res) => {
                  if (err) done(err);
                  resolve();
                });
            });
          });

          // コメント作成
          const promiseComment = new Promise((resolve) => {
            const userId = 0;
            request(app)
              .post(`/schedules/${scheduleId}/users/${userId}/comments`)
              .send({ comment: 'testcomment' })
              .expect('{"status":"OK","comment":"testcomment"}')
              .end((err, res) => {
                if (err) done(err);
                resolve();
              });
          });

          // 削除
          const promiseDeleted = Promise.all([promiseAvailability, promiseComment]).then(() => {
            return new Promise((resolve) => {
              request(app)
                .post(`/schedules/${scheduleId}?delete=1`)
                .end((err, res) => {
                  if (err) done(err);
                  resolve();
                });
            });
          });

          // テスト
          promiseDeleted.then(() => {
            const p1 = Comment.findAll({
              where: { scheduleId: scheduleId }
            }).then((comments) => {
              assert.strictEqual(comments.length, 0);
            });
            const p2 = Availability.findAll({
              where: { scheduleId: scheduleId }
            }).then((availabilities) => {
              assert.strictEqual(availabilities.length, 0);
            });
            const p3 = Candidate.findAll({
              where: { scheduleId: scheduleId }
            }).then((candidates) => {
              assert.strictEqual(candidates.length, 0);
            });
            const p4 = Schedule.findByPk(scheduleId).then((schedule) => {
              assert.strictEqual(!schedule, true);
            });
            Promise.all([p1, p2, p3, p4]).then(() => {
              if (err) return done(err);
              done();
            });
          });
        });
    });
  });
});
 */