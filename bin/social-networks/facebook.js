"use strict";

//https://developers.facebook.com/apps/

module.exports = function (app, passport) {

    var CLIENT_ID = '1480030035632922';
    var CLIENT_SECRET = '5bc3481e7e409391c1b90b9a97ca3be0';

    var FacebookStrategy = require('passport-facebook').Strategy;

    passport.use('facebook-authorize', new FacebookStrategy({
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: "/authorize/facebook/resolved"
    }, function (token, refreshToken, profile, done) {
        done(null, {
            profile: profile,
            provider: 'facebook'
        });
    }));

    app.get('/authorize/facebook', passport.authorize('facebook-authorize', {
        failureRedirect: '/authorize/facebook/rejected',
        scope: [
            'email'
        ]
    }));

    app.get('/authorize/facebook/resolved', passport.authorize('facebook-authorize', {
            failureRedirect: '/authorize/facebook/rejected'
        }), function (request, response) {
            response.render('oauth-authorize-resolved.ejs', {
                account: request.account
            });
        }
    );

    app.get('/authorize/facebook/rejected', function (request, response) {
        response.render('oauth-authorize-rejected.ejs');
    });
};