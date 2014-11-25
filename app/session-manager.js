"use strict";

module.exports = function (app, dbProvider, serviceProvider) {

    var Exception = require('../app/exception');

    serviceProvider.get('/is-authenticated', function (request, response, resultCallback) {
        var user = request.user;

        if (user) {
            resultCallback({
                data: {
                    isAuthenticated: true
                }
            });
        } else {
            resultCallback({
                data: {
                    isAuthenticated: false
                }
            });
        }
    });

    serviceProvider.get('/get-user-data', function (request, response, resultCallback) {
        var user = request.user;

        if (user) {

            resultCallback({
                data: {
                    userId: user.userId,
                    name: user.displayName,
                    role: user.role
                }
            });

        } else {
            throw new Exception(Exception.NOT_AUTHENTICATED, 'You are not authenticated');
        }
    });

    serviceProvider.get('/logout', function (request, response, resultCallback) {
        request.logout();
        resultCallback();
    });
};