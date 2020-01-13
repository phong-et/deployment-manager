var compress = require('compression');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var app = express();
var busboy = require('connect-busboy');

app.use(compress());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // default false
// use for upload file
app.use(busboy());

app.use(cookieParser());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));


//Passport setup
var passport = require('./passport');
var session = require('express-session');
app.use(session({secret: 'lollipop.et', resave: false, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

// Routing setup
// login
var rLogin = require('./routes/login')(passport);
app.use('/',rLogin);

// find site
var rFindSite = require('./routes/site_find');
app.use('/findsite',rFindSite);

// check date file deploy
var rCheckDateDeploy = require('./routes/site_checkdate');
app.use('/checkdate',rCheckDateDeploy);

// login checking
// var rCheckLogin = require('./routes/site_checklogin');
// app.use('/checklogin',rCheckLogin);

// user management
var rManageUser = require('./routes/user_manage');
app.use('/user_manage',rManageUser);

// user finding statistic
var rUserFindStatistic = require('./routes/user_find_statistic');
app.use('/user_find_statistic',rUserFindStatistic);

// user deploy statistic
var rUserDeployStatistic = require('./routes/user_deploy_statistic');
app.use('/user_deploy_statistic',rUserDeployStatistic);

var rSiteLogTask = require('./routes/site_log_task');
app.use('/site_log_task', rSiteLogTask);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
