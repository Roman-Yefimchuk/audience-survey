"use strict";

(function (require) {

    var _ = require('underscore');
    var Q = require('q');
    var Promise = Q['promise'];

    var AuthSessionProvider = require('./providers/auth-session-provider');
    var RequestUtils = require('./utils/request-utils');
    var RequestError = require('./request-error');

    function RequestFilter(action) {
        this.action = action;
    }

    RequestFilter.prototype = {
        constructor: RequestFilter,
        invoke: function (request) {
            return this.action(request);
        }
    };

    function getAuthSession(request) {
        return RequestUtils.getAuthSession(request, function () {
            return RequestError.badRequest({
                code: 'AUTHENTICATION.BAD_TOKEN'
            });
        }, function () {
            return RequestError.unauthorized({
                code: 'AUTHENTICATION.INVALID_TOKEN'
            });
        });
    }

    RequestFilter.checkAuthorization = function () {
        return new RequestFilter(function (request) {

            return Promise(function (resolve, reject) {

                getAuthSession(request).then(function (authSession) {

                    if (_.now() >= authSession.expirationDate) {

                        AuthSessionProvider.removeAuthSessionByToken(authSession.token)
                            .then(function () {
                                reject(RequestError.unauthorized({
                                    code: 'AUTHENTICATION.TOKEN_EXPIRED'
                                }));
                            }, function (e) {
                                reject(e);
                            });
                    } else {

                        resolve();
                    }
                }, function (e) {
                    reject(e);
                });
            });
        });
    };

    RequestFilter.checkOwnerAccess = function (paramName) {
        return new RequestFilter(function (request) {

                var userId = request.params[paramName];

                return Promise(function (resolve, reject) {

                    getAuthSession(request).then(function (authSession) {

                        if (authSession.userId == userId) {
                            resolve();
                        } else {
                            reject(RequestError.forbidden())
                        }
                    }, function () {
                        reject(e);
                    });
                });
            }
        );
    };

    RequestFilter.checkRole = function (roles) {
        return new RequestFilter(function (request) {

                return Promise(function (resolve, reject) {

                    getAuthSession(request).then(function (authSession) {

                        if (_.indexOf(roles, authSession.userRole) != -1) {
                            resolve();
                        } else {
                            reject(RequestError.forbidden())
                        }
                    }, function (e) {
                        reject(e);
                    });
                });
            }
        );
    };

    module.exports = RequestFilter;

})(require);