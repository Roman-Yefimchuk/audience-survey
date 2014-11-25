"use strict";

(function (require) {

    module.exports = function (app, passport) {

        var Exception = require('../exception');
        var JSON = require('json3');

        function getError(error) {
            if (error instanceof Exception) {
                return error;
            }
            return new Exception(Exception.UNHANDLED_EXCEPTION, 'Unhandled exception', error);
        }

        function send(response, data) {
            process.nextTick(function () {
                var json = JSON.stringify(data);
                response.send(json);
            });
        }

        function getAuthenticateHandler(request, response, callback) {
            return function (error, user, info) {
                if (error) {
                    send(response, {
                        status: false,
                        error: getError(error)
                    });
                } else {
                    if (info instanceof Exception) {
                        send(response, {
                            status: false,
                            error: info
                        });
                    } else {
                        if (user) {
                            request.logIn(user, function (error) {
                                if (error) {
                                    send(response, {
                                        status: false,
                                        error: getError(error)
                                    });
                                } else {

                                    var getUser = function () {
                                        return {
                                            name: user.displayName,
                                            role: user.role
                                        }
                                    };

                                    if (callback) {
                                        callback(user, function () {
                                            send(response, {
                                                status: true,
                                                data: {
                                                    user: getUser()
                                                }
                                            });
                                        });
                                    } else {
                                        send(response, {
                                            status: true,
                                            data: {
                                                user: getUser()
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            send(response, {
                                status: false,
                                error: new Exception(Exception.USER_NOT_FOUND, 'User not found.')
                            });
                        }
                    }
                }
            };
        }

        app.post('/api/authenticate/login', function (request, response, next) {
            var authenticateHandler = getAuthenticateHandler(request, response);
            passport.authenticate('local-login', authenticateHandler)(request, response, next);
        });

        app.post('/api/authenticate/sign-up', function (request, response, next) {
            var authenticateHandler = getAuthenticateHandler(request, response);
            passport.authenticate('local-sign-up', authenticateHandler)(request, response, next);
        });
    };

})(require);