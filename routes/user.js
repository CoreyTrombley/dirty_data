
/*
 * GET users listing.
 */
var express = require('express');
var app = express();

var User = require('../models/user.js');


exports.findSelf = function(req, res){
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