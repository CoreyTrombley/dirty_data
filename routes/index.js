
/*
 * GET home page.
 */

var path = require('path');
var User = require(path.join(__dirname, '../models/user.js'));

exports.index = function(req, res){
  res.render('index', { user: req.user });
};

exports.login = function(req, res) {
  res.render('login');
}

exports.dashboard = function(req, res) {
  res.render('dashboard');
}

exports.range = function (req, res) {
  res.render('range')
}