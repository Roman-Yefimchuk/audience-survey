"use strict";

(function (require) {

    var _ = require('underscore');
    var Promise = require('q')['promise'];
    var DbProvider = require('../db-provider').usePath('sql/auth-session/');
    var DbHelper = require('./../../utils/db/db-helper');
    var SecurityUtils = require('./../../utils/security-utils');

    function createAuthSession(userId, userRole) {

        return Promise(function (resolve, reject) {

            removeAuthSessionByUserId(userId)
                .then(function () {

                    var token = SecurityUtils.generateToken();
                    var expirationDate = _.now() + (1000 * 60 * 60);

                    DbProvider.executeQuery('create-auth-session.sql', {
                        userId: DbHelper.parseRecordId(userId),
                        userRole: userRole,
                        token: token,
                        expirationDate: expirationDate
                    }).then(function () {
                        resolve({
                            userId: DbHelper.parseRecordId(userId),
                            userRole: userRole,
                            token: token,
                            expirationDate: expirationDate
                        });
                    }).catch(function (e) {
                        reject(e);
                    });
                })
                .catch(function (e) {
                    reject(e);
                });
        });
    }

    function findAuthSessionByToken(token) {
        return Promise(function (resolve, reject) {
            DbProvider.executeQuery('find-auth-session-by-token.sql', {
                token: token
            }).then(function (result) {
                if (result.length > 0) {
                    var authSession = result[0];
                    resolve({
                        userId: DbHelper.parseRecordId(authSession.userId),
                        userRole: authSession.userRole,
                        token: authSession.token,
                        expirationDate: authSession.expirationDate
                    });
                } else {
                    resolve();
                }
            }).catch(function (e) {
                reject(e);
            });
        });
    }

    function findAuthSessionByUserId(userId) {
        return Promise(function (resolve, reject) {
            DbProvider.executeQuery('find-auth-session-by-user-id.sql', {
                userId: DbHelper.parseRecordId(userId)
            }).then(function (result) {
                if (result.length > 0) {
                    var authSession = result[0];
                    resolve({
                        userId: DbHelper.parseRecordId(authSession.userId),
                        token: token,
                        expirationDate: authSession.expirationDate
                    });
                } else {
                    resolve();
                }
            }).catch(function (e) {
                reject(e);
            });
        });
    }

    function removeAuthSessionByToken(token) {
        return Promise(function (resolve, reject) {
            DbProvider.executeQuery('remove-auth-session-by-token.sql', {
                token: token
            }).then(function (result) {
                if (result > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch(function (e) {
                reject(e);
            });
        });
    }

    function removeAuthSessionByUserId(userId) {
        return Promise(function (resolve, reject) {
            DbProvider.executeQuery('remove-auth-session-by-user-id.sql', {
                userId: DbHelper.parseRecordId(userId)
            }).then(function (result) {
                if (result > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch(function (e) {
                reject(e);
            });
        });
    }

    module.exports = {
        createAuthSession: createAuthSession,
        findAuthSessionByToken: findAuthSessionByToken,
        findAuthSessionByUserId: findAuthSessionByUserId,
        removeAuthSessionByToken: removeAuthSessionByToken,
        removeAuthSessionByUserId: removeAuthSessionByUserId
    }

})(require);