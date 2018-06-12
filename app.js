global.__base = __dirname + '/';

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sitemap = require('express-sitemap');

var indexRouter = require('./routes/index');

var app = express();

// https://prerender.io
app.use(require('prerender-node').set('prerenderToken', 'DNctT8hQbQ0C5Kirg8EC'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.use('/', indexRouter);

var map = sitemap({
  map: {
    '/': ['get']
  },
  route: {
    '/': {
      changefreq: 'always',
      priority: 1.0,
    }
  }
});

app.get('/sitemap.xml', function(req, res) {
  map.XMLtoWeb(res);
}).get('/robots.txt', function(req, res) {
  map.TXTtoWeb(res);
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
