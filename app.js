var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var session = require('express-session');
var passport = require('passport');

var app = express();

// DB Initialize
var User = require('./models/User');
var Theme = require('./models/Theme');
var Hitokoto = require('./models/Hitokoto');
var Star = require('./models/Star');
(async () => {
  await User.sync();
  Theme.belongsTo(User, { foreignKey: 'user_id' });
  await Theme.sync();
  Hitokoto.belongsTo(User, { foreignKey: 'user_id' });
  Hitokoto.belongsTo(Theme, { foreignKey: 'theme_id' });
  await Hitokoto.sync();
  Star.belongsTo(User, { foreignKey: 'user_id' });
  Star.belongsTo(Hitokoto, { foreignKey: 'hitokoto_id' });
  Star.sync();
})();

// Auth and Session Settings
var GitHubStrategy = require('passport-github2').Strategy;
var GITHUB_CLIENT_ID = 'cdcc942fbc66b55cb2f0';
var GITHUB_CLIENT_SECRET = '9705265b28b9abd432499bcc749969f82eee68a0';
passport.serializeUser(function (user, done) { done(null, user); });
passport.deserializeUser(function (obj, done) { done(null, obj); });
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:8000/auth/github/callback'
},
  function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      User.upsert({
        userId: profile.id,
        username: profile.username
      }).then(() => {
        done(null, profile);
      });
    });
  }
));
app.use(session({ secret: 'e55be81b307c1c09', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

// Security Settings
app.use(helmet());

// Frontend Settings
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

//Serverside Settings
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Routing
var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var userRouter = require('./routes/user');
app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/mypage', userRouter);

app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }),
  function (req, res) {
});

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function (req, res) {
    var loginFrom = req.cookies.loginFrom;
    // オープンリダイレクタ脆弱性対策
    if (loginFrom &&
      loginFrom.startsWith('/')) {
      res.clearCookie('loginFrom');
      res.redirect(loginFrom);
    } else {
      res.redirect('/');
    }
});

// Error Routing
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
