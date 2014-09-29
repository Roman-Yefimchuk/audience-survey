"use strict";

(function (require) {

    var LocalStrategy = require('passport-local').Strategy;

    var _ = require('underscore');
    var security = require('../utils/security');

    module.exports = function (passport, dbProvider) {

        var Exception = require('../exception');

        passport.serializeUser(function (user, done) {
            done(null, user.name);
        });

        passport.deserializeUser(function (name, done) {
            try {
                dbProvider.findUser(name, function (user) {
                    done(null, user);
                });
            } catch (error) {
                done(error);
            }
        });

        passport.use('local-login', new LocalStrategy({
            usernameField: 'name',
            passwordField: 'password',
            passReqToCallback: true
        }, function (request, name, password, done) {

            process.nextTick(function () {
                try {
                    dbProvider.findUser(name, function (user) {
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
                    });
                } catch (error) {
                    error = new Exception(Exception.UNHANDLED_EXCEPTION, "Can't find user.", error);
                    done(null, null, error);
                }
            });
        }));

        passport.use('local-sign-up', new LocalStrategy({
                usernameField: 'name',
                passwordField: 'password',
                passReqToCallback: true
            }, function (request, name, password, done) {

                process.nextTick(function () {
                    try {
                        dbProvider.findUser(name, function (user) {

                            if (user) {
                                var error = new Exception(Exception.NAME_ALREADY_EXIST, 'That name is already taken.');
                                return done(null, null, error);
                            }

                            if (request.user) {
                                user = request.user;
                                user.update({
                                    name: name,
                                    password: security.generateHash(password)
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
                                try {
                                    dbProvider.createUser({
                                        name: name,
                                        password: security.generateHash(password),
                                        role: 'user'
                                    }, function (user) {
                                        done(null, user);
                                    });
                                } catch (error) {
                                    error = new Exception(Exception.UNHANDLED_EXCEPTION, "Can't create user.");
                                    done(null, null, error);
                                }

                            }
                        });
                    } catch (error) {
                        error = new Exception(Exception.UNHANDLED_EXCEPTION, "Can't find user.", error);
                        done(null, null, error);
                    }
                });
            })
        );
    };

})(require);