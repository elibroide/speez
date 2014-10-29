// passport.js

var LocalStrategy = require('passport-local').Strategy;
var User = require('./../model/user');
var _ = require('underscore');

module.exports = function(app, passport, db) {
	
	// used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.account.username);
    });

    // used to deserialize the user
    passport.deserializeUser(function(username, done) {
		User.findOne({ 'account.username': username }, 'account', function(err, data){
			done(err, data);
		});
    });


	passport.use('local-login', new LocalStrategy(
		function(username, password, done) {
			User.findOne()
				.or([{'account.username': username }, { 'account.email': username }])
				.exec(function(err, data){
				console.log('Trying to login ', username, password);
				if (err) { 
					return done(err); 
				}
				if (!data) {
					return done(null, false, { message: 'Incorrect username.' });
				}
				if (!data.validPassword(password)) {
					return done(null, false, { message: 'Incorrect password.' });
				}
				return done(null, data);
			});
		}
	));

	passport.use('local-signup', new LocalStrategy({
		passReqToCallback : true
	},
		function(req, username, password, done) {
			User.findOne()
				.or([{'account.username': username }, { 'account.email': username }])
				.exec(function(err, data){
				console.log('Trying to signup ', username, password, err);
				if (err) { 
					return done(err); 
				}
				if (data) {
					return done(null, false, { message: 'User already signed up.' });
				}
				// TODO: Check the validity of the password
				// Checking required
				var bodyKeys = _.keys(req.body);
				var required = _.filter(['email'], function(key){
					return !_.contains(bodyKeys, key);
				});
				if(required.length){
					return done(null, false, { message: 'Missing ' + required.join(', ') })
				}

				// TODO: Validify email

				var newUser = new User();
				newUser.account = {
					username: username,
					password: newUser.generateHash(password),
					email: req.body.email,
				};
				newUser.own = [];
                newUser.save(function(err){
					if (err){
                    	throw err;
                    }
                    return done(null, newUser);
                });
				
			});
		}
	));

}