"use strict";

(function (require) {

    var _ = require('underscore');
    var Promise = require('q')['promise'];
    var DbProvider = require('../db-provider').usePath('sql/user/');
    var DbHelper = require('./../../utils/db/db-helper');

    function createUser(model, generatePasswordHash, onUserExists) {

        return Promise(function (resolve, reject) {

            findUserByGenericId(model.genericId)
                .then(function (user) {

                    if (user) {

                        try {
                            onUserExists(user);
                        } catch (e) {
                            reject(e);
                        }
                    } else {

                        DbProvider.executeQuery('create-user.sql', {
                            genericId: model.genericId,
                            rating: 0.0,
                            registeredDate: _.now(),
                            profile: {
                                name: model.name,
                                passwordHash: generatePasswordHash(model.password),
                                email: model.email,
                                isEmailVerified: model.isEmailVerified
                            },
                            role: model.role
                        }).then(function (results) {

                            var user = results[0];
                            var userId = DbHelper.getRecordId(user);

                            getUser(userId)
                                .then(function (user) {
                                    resolve(user);
                                })
                                .catch(function (e) {
                                    reject(e);
                                });
                        }).catch(function (e) {
                            reject(e);
                        });
                    }
                })
                .catch(function (e) {

                    reject(e);
                });
        });
    }

    function findUser(model, verifyPasswordHash) {

        return Promise(function (resolve, reject) {

            DbProvider.executeQuery('find-user-by-generic-id.sql', {
                genericId: model.genericId
            }).then(function (result) {

                if (result.length > 0) {

                    var user = result[0];
                    var profile = user.profile;

                    try {

                        verifyPasswordHash(model.password, profile.passwordHash);

                        resolve({
                            id: DbHelper.getRecordId(user),
                            rating: user.rating,
                            registeredDate: user.registeredDate,
                            profile: {
                                name: profile.name,
                                email: profile.email,
                                isEmailVerified: profile.isEmailVerified
                            },
                            role: user.role
                        });

                    } catch (e) {
                        reject(e);
                    }

                } else {
                    resolve();
                }
            }).catch(function (e) {
                reject(e);
            });
        });
    }

    function findUserByGenericId(genericId) {

        return Promise(function (resolve, reject) {

            DbProvider.executeQuery('find-user-by-generic-id.sql', {
                genericId: genericId
            }).then(function (result) {

                if (result.length > 0) {

                    var user = result[0];
                    var profile = user.profile;

                    resolve({
                        id: DbHelper.getRecordId(user),
                        rating: user.rating,
                        registeredDate: user.registeredDate,
                        profile: {
                            name: profile.name,
                            email: profile.email,
                            isEmailVerified: profile.isEmailVerified
                        },
                        role: user.role
                    });
                } else {

                    resolve();
                }
            }).catch(function (e) {

                reject(e);
            });
        });
    }

    function getUser(userId) {

        return Promise(function (resolve, reject) {

            DbProvider.executeQuery('find-user-by-id.sql', {
                userId: DbHelper.parseRecordId(userId)
            }).then(function (result) {

                if (result.length > 0) {

                    var user = result[0];
                    var profile = user.profile;

                    resolve({
                        id: DbHelper.getRecordId(user),
                        rating: user.rating,
                        registeredDate: user.registeredDate,
                        profile: {
                            name: profile.name,
                            email: profile.email,
                            isEmailVerified: profile.isEmailVerified
                        },
                        role: user.role
                    });
                } else {

                    resolve();
                }
            }).catch(function (e) {

                reject(e);
            });
        });
    }

    function getUserName(userId) {

        return Promise(function (resolve, reject) {

            DbProvider.executeQuery('get-user-name-by-id.sql', {
                userId: DbHelper.parseRecordId(userId)
            }).then(function (result) {

                if (result.length > 0) {

                    var user = result[0];

                    resolve(user.name);
                } else {

                    resolve();
                }
            }).catch(function (e) {

                reject(e);
            });
        });
    }

    module.exports = {
        createUser: createUser,
        findUser: findUser,
        findUserByGenericId: findUserByGenericId,
        getUser: getUser,
        getUserName: getUserName
    }

})(require);