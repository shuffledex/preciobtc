var express = require('express');
var router = express.Router();

var admin = require('firebase-admin');
var serviceAccount = require(__base + 'preciobtc-firebase-adminsdk-nktyd-8c7f1e38eb.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://preciobtc.firebaseio.com'
});

var db = admin.database();

/* GET home page. */
router.get('/', function(req, res, next) {
  var io = req.app.get('socketio');
  io.on('connection', function(socket){
    var ref = db.ref("sitios/ARS");
    ref.on("value", function(snapshot) {
      socket.emit('prices', snapshot.val());
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    });
  });
  res.render('index', { title: 'Precio BTC' });
});

module.exports = router;
