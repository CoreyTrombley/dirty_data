
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

var mongoose = require ("mongoose"); // The reason for this demo.

// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.
var uristring =
process.env.MONGOLAB_URI ||
process.env.MONGOHQ_URL ||
'mongodb://localhost/' + app.get('env');

// The http server will listen to an appropriate port, or default to
// port 5000.
var theport = process.env.PORT || 5000;

// Makes connection asynchronously.  Mongoose will queue up database
// operations and release them when the connection is complete.
mongoose.connect(uristring, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + uristring);
  }
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
  callbackURL: "http://dirty-data.herokuapp.com/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({
      "facebookId" : profile.id
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
            provider: 'facebook',
            facebookId: profile.id,
            name: profile.displayName,
            username: profile.username,
            ProfileUrl: profile.profileUrl,
            fbToken: accessToken,
            gender: profile._json.gender,
            friendCount: data.length
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
    callbackURL: "http://dirty-data.herokuapp.com/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    User.findOne({
      "twitterId" : profile.id
    }, function(err, user) {
      if (err) {
        return done(err);
      }
      //No user was found... so create a new user with values from Facebook (all the profile. stuff)
      if (!user) {
        user = new User({
          provider: "twitter",
          twitterId: profile.id,
          name: profile.displayName,
          username: profile.username,
          ProfileUrl: "www.twitter.com/" + profile.username,
          twitterToken: token,
          friendCount: profile._json.friends_count,
          followCount: profile._json.followers_count,
          ffRatio: profile._json.followers_count / profile._json.friends_count,
          statusCount: profile._json.statuses_count,
          twitterJoinDate: profile._json.created_at,
          location: profile._json.location
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
app.get('/self', user.findSelf);
app.get('/ff', user.accounts)

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
