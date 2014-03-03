
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();
var config = require('./config');

// models
var User = require('./models/user.js');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/' + app.get('env'));
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  //do stuffs with db
  console.log('db connection a go')
});

var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new FacebookStrategy({
  clientID: config.fb.id,
  clientSecret: config.fb.secret,
  callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({
      "facebook.id" : profile.id
    }, function(err, user) {
      if (err) {
        return done(err);
      }
      //No user was found... so create a new user with values from Facebook (all the profile. stuff)
      if (!user) {
        var fbapi = require('facebook-api');
        var client = fbapi.user(accessToken); // do not set an access token
        client.me.friends(function(err, data, user){
          user = new User({
            name: profile.displayName,
            username: profile.username,
            profileUrl: profile.profileUrl,
            provider: 'facebook',
            token: accessToken,
            //now in the future searching on User.findOne({'facebook.id': profile.id } will match because of this next line
            facebook: profile._json,
            fbFriends: data
          });
          user.save(function(err) {
            if (err) console.log(err);
            console.log('making a new user')
            return done(err, user);
          });
        });
      } else {
        //found user. Return
        console.log('found the user')
        return done(err, user);
      }
    });
}));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('asdf'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
//     /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'));

// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/dashboard',
                                      failureRedirect: '/login' }));

app.get('/', routes.index);
app.get('/login', routes.login);
app.get('/dashboard', routes.dashboard);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
