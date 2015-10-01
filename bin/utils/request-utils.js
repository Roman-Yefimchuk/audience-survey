"use strict";

(function (require) {

    var Q = require('q');
    var Promise = Q['promise'];

    var AuthSessionProvider = require('./../providers/auth-session-provider');
    var RequestUtils = require('./../utils/request-utils');

    function getToken(request) {
        return (request.headers || {})['x-access-token'];
    }

    function getAuthSession(request, onBadToken, onInvalidToken) {

        return Promise(function (resolve, reject) {

            var token = getToken(request);
            if (token) {

                AuthSessionProvider.getAuthSessionByToken(token)
                    .then(function (authSession) {

                        if (authSession) {

                            resolve(authSession);
                        } else {

                            reject((onInvalidToken || function () {
                            })());
                        }
                    })
                    .catch(function (e) {
                        reject(e);
                    });
            } else {

                reject((onBadToken || function () {
                })());
            }
        });
    }

    module.exports = {
        getToken: getToken,
        getAuthSession: getAuthSession
    };

})(require);