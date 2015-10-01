"use strict";

(function (require) {

    var Q = require('q');
    var Promise = Q['promise'];

    var ProfileRepository = require('./../db/data-access-layers/profile-repository');
    var RequestFilter = require('./../request-filter');
    var RequestError = require('./../request-error');
    var SecurityUtils = require('./../utils/security-utils');
    var ControllerUtils = require('./../utils/controller-utils');
    var ValidationStrategy = require('./../model-validator-engine').ValidationStrategy;
    var ValidationRule = require('./../model-validator-engine').ValidationRule;

    function model() {
        return new ControllerUtils.RequestResolver('body');
    }

    module.exports = function (controller) {
        return controller({
            routePrefix: 'users/:userId/profile',
            actions: [
                {
                    route: '',
                    method: 'get',
                    params: ['userId'],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId')
                    ],
                    handler: function (userId) {

                        return Promise(function (resolve, reject) {

                            ProfileRepository.getProfile(userId)
                                .then(function (profile) {
                                    if (profile) {
                                        resolve(profile);
                                    } else {
                                        reject(RequestError.badRequest({
                                            code: 'COMMON.USER_NOT_FOUND'
                                        }));
                                    }
                                })
                                .catch(function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: 'update',
                    method: 'post',
                    params: ['userId', model()],
                    validationStrategy: new ValidationStrategy({
                        'name': {
                            rules: [
                                ValidationRule.minStringLength(3, "Min name length @{min} characters")
                            ]
                        }
                    }),
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId')
                    ],
                    handler: function (userId, model) {

                        return Promise(function (resolve, reject) {

                            ProfileRepository.updateProfile(userId, model)
                                .then(function (status) {
                                    if (status) {
                                        resolve();
                                    } else {
                                        reject(RequestError.badRequest({
                                            code: 'COMMON.USER_NOT_FOUND'
                                        }));
                                    }
                                })
                                .catch(function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: 'password/change',
                    method: 'post',
                    params: ['userId', model()],
                    validationStrategy: new ValidationStrategy({
                        'oldPassword': {
                            rules: [
                                ValidationRule.stringLength(6, 20, "Old password must be from @{min} to @{max} characters"),
                                ValidationRule.reqExpr(/(\w+){6}/, "Invalid password")
                            ]
                        },
                        'newPassword': {
                            rules: [
                                ValidationRule.stringLength(6, 20, "New password must be from @{min} to @{max} characters"),
                                ValidationRule.reqExpr(/(\w+){6}/, "Invalid password")
                            ]
                        }
                    }),
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId')
                    ],
                    handler: function (userId, model) {

                        return Promise(function (resolve, reject) {

                            ProfileRepository.changePassword(userId, model, function (password, passwordHash) {

                                if (SecurityUtils.validateHash(password, passwordHash)) {
                                    return;
                                }

                                throw RequestError.badRequest({
                                    code: 'AUTHORIZATION.INVALID_PASSWORD'
                                });

                            }, function (password) {
                                return SecurityUtils.generateHash(password);
                            }).then(function (status) {

                                if (status) {
                                    resolve();
                                } else {
                                    reject(RequestError.badRequest({
                                        code: 'COMMON.USER_NOT_FOUND'
                                    }));
                                }
                            }).catch(function (e) {
                                reject(e);
                            });
                        });
                    }
                }
            ]
        });
    };

})(require);