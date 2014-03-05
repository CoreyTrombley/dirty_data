
/*
 * GET users listing.
 */
var express = require('express');
var app = express();
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/' + app.get('env'));
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  //do stuffs with db
  console.log('db connection a go');
});
var User = require('../models/user.js');


exports.findSelf = function(req, res){
  console.log(req.user);
  var query = User.findOne(req.user)
  query.exec(function (err, user) {
    if (err) return handleError(err);
    res.send(user);
  })
};

exports.accounts = function(req, res) {
  User.find(function(err, accounts) {
    res.send(accounts);
  });
}