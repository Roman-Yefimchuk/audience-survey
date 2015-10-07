"use strict";

//https://apps.twitter.com/

module.exports = function (app, passport) {

    var CONSUMER_KEY = 'BmYfuwuPCXWs8HqOWuIgHlZPh';
    var CONSUMER_SECRET = 'Mq4RLfpdWSNgqilcCLnjxy1jKJSc3skitFH70tAmp19LdDJH2e';

    var TwitterStrategy = require('passport-twitter').Strategy;

    passport.use('twitter-authorize', new TwitterStrategy({
        consumerKey: CONSUMER_KEY,
        consumerSecret: CONSUMER_SECRET,
        callbackURL: "/authorize/twitter/resolved"
    }, function (token, tokenSecret, profile, done) {
        done(null, {
            profile: {
                id: profile.id,
                name: profile.displayName
            },
            provider: 'twitter'
        });
    }));

    app.get('/authorize/twitter', passport.authorize('twitter-authorize', {
        failureRedirect: '/authorize/twitter/rejected',
        scope: [
            'email'
        ]
    }));

    app.get('/authorize/twitter/resolved', passport.authorize('twitter-authorize', {
        failureRedirect: '/authorize/twitter/rejected'
    }), function (request, response) {
        response.render('oauth-authorize-resolved-redirect.ejs', {
            account: request.account
        });
    });

    app.get('/authorize/twitter/rejected', function (request, response) {
        response.render('oauth-authorize-rejected-redirect.ejs');
    });
};