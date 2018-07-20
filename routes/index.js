var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

var admin = require('firebase-admin');
var serviceAccount = require(__base + 'preciobtc-firebase-adminsdk-nktyd-8c7f1e38eb.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://preciobtc.firebaseio.com'
});

var db = admin.database();

router.get('/', function(req, res, next) {  
  res.render('index', {});
});

router.get('/cl', function(req, res, next) {
  res.render('index-cl', {});
});

router.get('/bitcoin-mejores-precios', function(req, res, next) {
  res.render('bitcoin-mejores-precios', {});
});

router.get('/bitcoin-calculadora', function(req, res, next) {
  res.render('bitcoin-calculadora', {});
});

router.get('/cl/bitcoin-mejores-precios', function(req, res, next) {
  res.render('bitcoin-mejores-precios-cl', {});
});

router.get('/cl/bitcoin-calculadora', function(req, res, next) {
  res.render('bitcoin-calculadora-cl', {});
});

router.get('/contacto', function(req, res, next) {
  res.render('contacto', {});
});

router.post('/contacto', function(req, res, next) {
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'preciobtccom@gmail.com',
      pass: 'bitcoinforever'
    }
  });

  var mailOptions = {
    from: req.body.email,
    to: 'hola@preciobtc.com',
    subject: req.body.razon,
    text: req.body.mensaje
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      res.redirect('/contacto/?success=false');
    } else {
      res.redirect('/contacto/?success=true');
    }
  });
});

module.exports = function (io) {
  io.on('connection', function (socket) {
    var refSitios = db.ref("sitios/ARS");
    var refDolar = db.ref("dolar/ARS");

    var refSitiosCl = db.ref("sitios/CL");
    var refDolarCl = db.ref("dolar/CL");

    var refBitfinex = db.ref("bitfinex");
    var refBitstamp = db.ref("bitstamp");

    refSitios.on("value", function(snapshot) {
      socket.emit('prices', snapshot.val());
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

    refDolar.on("value", function(snapshot) {
      socket.emit('dolar', snapshot.val());
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

    refSitiosCl.on("value", function(snapshot) {
      socket.emit('pricesCl', snapshot.val());
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

    refDolarCl.on("value", function(snapshot) {
      socket.emit('dolarCl', snapshot.val());
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

    refBitfinex.on("value", function(snapshot) {
      socket.emit('bitfinex', snapshot.val());
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

    refBitstamp.on("value", function(snapshot) {
      socket.emit('bitstamp', snapshot.val());
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });

  });
  return router;
};