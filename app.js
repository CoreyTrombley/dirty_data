
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
  , LocalStrategy = require('passport-local').Strategy
  , TwitterStrategy = require('passport-twitter').Strategy
  , FacebookStrategy = require('passport-facebook').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

passport.use(new FacebookStrategy({
  clientID: config.fb.id,
  clientSecret: config.fb.secret,
  callbackURL: "http://localhost:3000/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({
      "accounts.facebook.id" : profile.id
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
            fbProfileUrl: profile.profileUrl,
            fbToken: accessToken,
            //now in the future searching on User.findOne({'facebook.id': profile.id } will match because of this next line
            accounts: [{ facebook:{"profile": profile._json, friends: data}}]
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

passport.use(new TwitterStrategy({
    consumerKey: config.twitter.key,
    consumerSecret: config.twitter.secret,
    callbackURL: "http://localhost:3000/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    User.findOne({
      "accounts.twitter.id" : profile.id
    }, function(err, user) {
      if (err) {
        return done(err);
      }
      //No user was found... so create a new user with values from Facebook (all the profile. stuff)
      if (!user) {
        user = new User({
          name: profile.displayName,
          username: profile.username,
          twitterProfileUrl: profile.profileUrl,
          twitterToken: token,
          //now in the future searching on User.findOne({'facebook.id': profile.id } will match because of this next line
          accounts: [{ twitter:{"profile": profile._json}}]
        });
        user.save(function(err) {
          if (err) console.log(err);
          console.log('making a new user')
          return done(err, user);
        });
      } else {
        //found user. Return
        console.log('found the user')
        return done(err, user);
      }
    });
  }
));



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

// Redirect the user to Twitter for authentication.  When complete, Twitter
// will redirect the user back to the application at
//   /auth/twitter/callback
app.get('/auth/twitter', passport.authenticate('twitter'));

// Twitter will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/twitter/callback',
  passport.authenticate('twitter', { successRedirect: '/dashboard',
                                     failureRedirect: '/login' }));

app.get('/', routes.index);
app.get('/login', routes.login);
app.get('/dashboard', routes.dashboard);
app.get('/users', user.findAll);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
