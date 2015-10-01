"use strict";

(function (require) {

    var _ = require('underscore');
    var Q = require('q');
    var Promise = Q['promise'];

    var AuthSessionRepository = require('./../db/data-access-layers/auth-session-repository');

    var authSessions = [];

    function getAuthSessionByToken(token) {

        var authSession = _.findWhere(authSessions, {
            token: token
        });

        if (authSession) {
            return Q.when(authSession);
        }

        return Promise(function (resolve, reject) {

            AuthSessionRepository.findAuthSessionByToken(token)
                .then(function (authSession) {

                    if (authSession) {

                        authSessions.push(authSession);
                        resolve(authSession);
                    } else {
                        resolve();
                    }
                }, function (e) {
                    reject(e);
                });
        });
    }

    function removeAuthSessionByToken(token) {

        var i = 10;

        return Promise(function (resolve, reject) {

            AuthSessionRepository.removeAuthSessionByToken(token)
                .then(function (status) {

                    var authSession = _.findWhere(authSessions, {
                        token: token
                    });

                    if (authSession) {
                        authSessions = _.without(authSessions, authSession);
                    }

                    resolve(status);
                }, function (e) {
                    reject(e);
                });
        });
    }

    module.exports = {
        getAuthSessionByToken: getAuthSessionByToken,
        removeAuthSessionByToken: removeAuthSessionByToken
    };

})(require);