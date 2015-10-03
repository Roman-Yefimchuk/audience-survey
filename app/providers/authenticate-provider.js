"use strict";

(function (require) {

    var LocalStrategy = require('passport-local').Strategy;
    var FacebookStrategy = require('passport-facebook').Strategy;
    var TwitterStrategy = require('passport-twitter').Strategy;
    var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

    var _ = require('underscore');
    var security = require('../utils/security');
    var authorizationConfig = require('./../authorization-config');

    module.exports = function (passport, dbProvider) {

        var Exception = require('../exception');

        passport.serializeUser(function (user, done) {
            done(null, user.genericId);
        });

        passport.deserializeUser(function (genericId, done) {
            dbProvider.findUser(genericId, {
                success: function (user) {
                    done(null, user);
                },
                failure: function (error) {
                    done(error);
                }
            });
        });

        // =========================================================================
        // LOCAL LOGIN =============================================================
        // =========================================================================

        passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        }, function (request, email, password, done) {

            process.nextTick(function () {

                dbProvider.findUser(email, {
                    success: function (user) {
                        if (user) {
                            if (security.validPassword(user, password)) {
                                return done(null, user);
                            } else {
                                var error = new Exception(Exception.INVALID_PASSWORD, 'Oops! Wrong password.');
                                return done(null, null, error);
                            }
                        } else {
                            var error = new Exception(Exception.USER_NOT_FOUND, 'No user found.');
                            return done(null, null, error);
                        }
                    },
                    failure: function (error) {
                        error = new Exception(Exception.UNHANDLED_EXCEPTION, "Can't find user.", error);
                        done(null, null, error);
                    }
                });
            });
        }));

        // =========================================================================
        // LOCAL SIGNUP ============================================================
        // =========================================================================

        passport.use('local-sign-up', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        }, function (request, email, password, done) {

            process.nextTick(function () {

                function generateToken() {
                    return security.randomString();
                }

                dbProvider.findUser(email, {
                    success: function (user) {

                        if (user) {
                            var error = new Exception(Exception.EMAIL_ALREADY_EXIST, 'That email is already taken.');
                            return done(null, null, error);
                        }

                        if (request.user) {
                            user = request.user;
                            user.update({
                                displayName: request.body['name'],
                                password: security.generateHash(password),
                                token: generateToken(),
                                email: email
                            }, {
                                success: function (user) {
                                    done(null, user);
                                },
                                failure: function (error) {
                                    error = new Exception(Exception.UNHANDLED_EXCEPTION, "Can't update user.");
                                    done(null, null, error);
                                }
                            });
                        } else {
                            dbProvider.createUser({
                                role: request.body['role'] || 'user',
                                genericId: email,
                                displayName: request.body['name'],
                                email: email,
                                password: security.generateHash(password),
                                token: generateToken(),
                                authorizationProvider: 'local',
                                registeredDate: _.now()
                            }, {
                                success: function (user) {
                                    done(null, user);
                                },
                                failure: function (error) {
                                    error = new Exception(Exception.UNHANDLED_EXCEPTION, "Can't create user.");
                                    done(null, null, error);
                                }
                            });
                        }
                    },
                    failure: function (error) {
                        error = new Exception(Exception.UNHANDLED_EXCEPTION, "Can't find user.", error);
                        done(null, null, error);
                    }
                });
            });
        }));

        function externalAuthorization(user, provider, done) {
            process.nextTick(function () {
                if (user) {
                    user.update({
                        genericId: provider.genericId,
                        token: provider.token,
                        displayName: provider.displayName,
                        email: provider.email
                    }, {
                        success: function (user) {
                            done(null, user);
                        },
                        failure: function (error) {
                            done(error);
                        }
                    });
                } else {
                    dbProvider.findUser(provider.genericId, {
                        success: function (user) {
                            if (user) {
                                if (user.isAuthenticated()) {
                                    done(null, user);
                                } else {
                                    user.update({
                                        token: provider.token,
                                        displayName: provider.displayName,
                                        email: provider.email
                                    }, {
                                        success: function (user) {
                                            done(null, user);
                                        },
                                        failure: function (error) {
                                            done(error);
                                        }
                                    });
                                }
                            } else {
                                dbProvider.createUser({
                                    genericId: provider.genericId,
                                    displayName: provider.displayName,
                                    password: undefined,
                                    email: provider.email,
                                    token: provider.token,
                                    authorizationProvider: provider.name,
                                    registeredDate: _.now()
                                }, {
                                    success: function (user) {
                                        done(null, user);
                                    },
                                    failure: function (error) {
                                        done(error);
                                    }
                                });
                            }
                        },
                        failure: function (error) {
                            done(error);
                        }
                    })
                }
            });
        }

        // =========================================================================
        // FACEBOOK ================================================================
        // =========================================================================

        passport.use(new FacebookStrategy({
            clientID: authorizationConfig.facebookAuth.clientID,
            clientSecret: authorizationConfig.facebookAuth.clientSecret,
            callbackURL: authorizationConfig.facebookAuth.callbackURL,
            passReqToCallback: true
        }, function (request, token, refreshToken, profile, done) {

            var name = profile.name;

            externalAuthorization(request.user, {
                genericId: profile.id,
                displayName: name.givenName + ' ' + name.familyName,
                email: profile.emails[0].value,
                token: token,
                name: 'facebook'
            }, done);
        }));

        // =========================================================================
        // TWITTER =================================================================
        // =========================================================================

        passport.use(new TwitterStrategy({
            consumerKey: authorizationConfig.twitterAuth.consumerKey,
            consumerSecret: authorizationConfig.twitterAuth.consumerSecret,
            callbackURL: authorizationConfig.twitterAuth.callbackURL,
            passReqToCallback: true
        }, function (request, token, tokenSecret, profile, done) {
            externalAuthorization(request.user, {
                genericId: profile.id,
                displayName: profile.displayName,
                token: token,
                name: 'twitter'
            }, done);
        }));

        // =========================================================================
        // GOOGLE ==================================================================
        // =========================================================================

        passport.use(new GoogleStrategy({
            clientID: authorizationConfig.googleAuth.clientID,
            clientSecret: authorizationConfig.googleAuth.clientSecret,
            callbackURL: authorizationConfig.googleAuth.callbackURL,
            passReqToCallback: true
        }, function (request, token, refreshToken, profile, done) {
            externalAuthorization(request.user, {
                genericId: profile.id,
                displayName: profile.displayName,
                token: token,
                email: profile.emails[0].value,
                name: 'google'
            }, done);
        }));
    };
})(require);