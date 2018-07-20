global.__base = __dirname + '/';

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sm = require('sitemap');

var app = express();
app.io = require('socket.io')();

var sitemap = sm.createSitemap ({
  cacheTime: 600000,
  urls: [
    {url: 'https://www.preciobtc.com/', changefreq: 'daily', priority: 1},
    {url: 'https://www.preciobtc.com/bitcoin-mejores-precios', changefreq: 'daily', priority: 0.9},
    {url: 'https://www.preciobtc.com/bitcoin-calculadora', changefreq: 'daily', priority: 0.9},
    {url: 'https://www.preciobtc.com/contacto', changefreq: 'monthly', priority: 0.7},
    {url: 'https://www.preciobtc.com/cl', changefreq: 'daily', priority: 1},
    {url: 'https://www.preciobtc.com/cl/bitcoin-mejores-precios', changefreq: 'daily', priority: 0.9},
    {url: 'https://www.preciobtc.com/cl/bitcoin-calculadora', changefreq: 'daily', priority: 0.9}
  ]
});

var indexRouter = require('./routes/index')(app.io);

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

app.get('/sitemap.xml', function(req, res) {
  sitemap.toXML( function (err, xml) {
    if (err) {
      return res.status(500).end();
    }
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  });
});

app.get('/robots.txt', function (req, res) {
  res.type('text/plain');
  res.send("User-agent: *\nDisallow:");
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
