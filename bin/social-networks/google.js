"use strict";

//https://code.google.com/apis/console

module.exports = function (app, passport) {

    var CLIENT_ID = '947163851391-gbf205c3coontdg6ot8drh480694oe0b.apps.googleusercontent.com';
    var CLIENT_SECRET = 'XCcKvcoQcJ-blue-N8qAtHfX';

    var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

    passport.use('google-authorize', new GoogleStrategy({
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        callbackURL: "/authorize/google/resolved"
    }, function (token, refreshToken, profile, done) {
        done(null, {
            profile: profile,
            provider: 'google'
        });
    }));

    app.get('/authorize/google', passport.authorize('google-authorize', {
        failureRedirect: '/authorize/google/rejected',
        scope: [
            'profile',
            'email'
        ]
    }));

    app.get('/authorize/google/resolved', passport.authorize('google-authorize', {
        failureRedirect: '/authorize/google/rejected'
    }), function (request, response) {
        response.render('oauth-authorize-resolved.ejs', {
            account: request.account
        });
    });

    app.get('/authorize/google/rejected', function (request, response) {
        response.render('oauth-authorize-rejected.ejs');
    });
};