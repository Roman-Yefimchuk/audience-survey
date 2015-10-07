"use strict";

(function (require) {

    var _ = require('underscore');
    var Q = require('q');
    var Promise = Q['promise'];

    var UserRepository = require('./../db/data-access-layers/user-repository');
    var AuthSessionRepository = require('../db/data-access-layers/auth-session-repository');
    var RequestError = require('./../request-error');
    var SecurityUtils = require('./../utils/security-utils');
    var ControllerUtils = require('./../utils/controller-utils');
    var ValidationStrategy = require('./../model-validator-engine').ValidationStrategy;
    var ValidationRule = require('./../model-validator-engine').ValidationRule;
    var RequestUtils = require('./../utils/request-utils');
    var AuthSessionProvider = require('../providers/auth-session-provider');
    var RequestFilter = require('./../request-filter');

    function request() {
        return new ControllerUtils.RequestResolver();
    }

    function query(queryName) {
        return new ControllerUtils.RequestResolver('query.' + queryName);
    }

    function model() {
        return new ControllerUtils.RequestResolver('body');
    }

    function login(user) {

        return Promise(function (resolve, reject) {

            AuthSessionRepository.createAuthSession(user.id, user.role)
                .then(function (authSession) {
                    resolve(authSession);
                })
                .catch(function (e) {
                    reject(e);
                });
        });
    }

    module.exports = function (controller) {
        return controller({
            routePrefix: 'auth',
            actions: [
                {
                    route: 'signIn',
                    method: 'post',
                    params: [model()],
                    validationStrategy: new ValidationStrategy({
                        'email': {
                            rules: [
                                ValidationRule.email("Invalid email")
                            ]
                        },
                        'password': {
                            rules: [
                                ValidationRule.stringLength(6, 20, "Password must be from @{min} to @{max} characters"),
                                ValidationRule.reqExpr(/(\w+){6}/, "Invalid password")
                            ]
                        }
                    }),
                    handler: function (model) {

                        return Promise(function (resolve, reject) {

                            UserRepository.findUser({
                                genericId: model.email,
                                password: model.password
                            }, function (password, passwordHash) {

                                if (SecurityUtils.validateHash(password, passwordHash)) {
                                    return;
                                }

                                throw RequestError.badRequest({
                                    code: 'AUTHORIZATION.INVALID_PASSWORD'
                                });

                            }).then(function (user) {

                                if (user) {
                                    login(user)
                                        .then(function (authSession) {
                                            resolve(authSession);
                                        })
                                        .catch(function (e) {
                                            reject(e);
                                        });
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
                },
                {
                    route: 'signUp',
                    method: 'post',
                    params: [model()],
                    validationStrategy: new ValidationStrategy({
                        'name': {
                            rules: [
                                ValidationRule.stringLength(3, 15, "Name must be from @{min} to @{max} characters"),
                                ValidationRule.reqExpr(/^(\w+){3}$/, "Invalid first name")
                            ]
                        },
                        'email': {
                            rules: [
                                ValidationRule.email("Invalid email")
                            ]
                        },
                        'password': {
                            rules: [
                                ValidationRule.stringLength(6, 20, "Password must be from @{min} to @{max} characters"),
                                ValidationRule.reqExpr(/(\w+){6}/, "Invalid password")
                            ]
                        }
                    }),
                    handler: function (model) {

                        return Promise(function (resolve, reject) {

                            UserRepository.createUser({
                                genericId: model.email,
                                name: model.name,
                                password: model.password,
                                email: model.email,
                                isEmailVerified: false,
                                role: model.role,
                                authorizationProvider: 'local'
                            }, function (password) {
                                return SecurityUtils.generateHash(password);
                            }, function () {
                                throw RequestError.badRequest({
                                    code: 'AUTHORIZATION.USER_ALREADY_EXISTS'
                                });
                            }).then(function (user) {

                                login(user)
                                    .then(function (authSession) {
                                        resolve(authSession);
                                    })
                                    .catch(function (e) {
                                        reject(e);
                                    });

                            }).catch(function (e) {
                                reject(e);
                            });
                        });
                    }
                },
                {
                    route: 'externalSignIn',
                    method: 'post',
                    params: [model()],
                    handler: function (model) {

                        return Promise(function (resolve, reject) {

                            UserRepository.findUser({
                                genericId: model.profileId
                            }).then(function (user) {

                                if (user) {
                                    login(user)
                                        .then(function (authSession) {
                                            resolve(authSession);
                                        })
                                        .catch(function (e) {
                                            reject(e);
                                        });
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
                },
                {
                    route: 'externalSignUp',
                    method: 'post',
                    params: [model()],
                    handler: function (model) {

                        return Promise(function (resolve, reject) {

                            UserRepository.createUser({
                                genericId: model.profileId,
                                name: model.name,
                                password: SecurityUtils.generateToken(8),
                                email: model.email,
                                isEmailVerified: model.isEmailVerified,
                                role: model.role,
                                authorizationProvider: model.authorizationProvider
                            }, function (password) {
                                return SecurityUtils.generateHash(password);
                            }, function () {
                                throw RequestError.badRequest({
                                    code: 'AUTHORIZATION.USER_ALREADY_EXISTS'
                                });
                            }).then(function (user) {

                                login(user)
                                    .then(function (authSession) {
                                        resolve(authSession);
                                    })
                                    .catch(function (e) {
                                        reject(e);
                                    });

                            }).catch(function (e) {
                                reject(e);
                            });
                        });
                    }
                },
                {
                    route: 'checkToken',
                    params: [query('token')],
                    handler: function (token) {

                        return Promise(function (resolve, reject) {

                            if (token) {

                                AuthSessionProvider.getAuthSessionByToken(token)
                                    .then(function (authSession) {

                                        if (authSession) {

                                            if (_.now() >= authSession.expirationDate) {

                                                resolve({
                                                    isAuthorized: false
                                                });
                                            } else {

                                                resolve({
                                                    isAuthorized: true
                                                });
                                            }
                                        } else {

                                            resolve({
                                                isAuthorized: false
                                            });
                                        }
                                    }, function (e) {
                                        reject(e);
                                    });
                            } else {
                                resolve({
                                    isAuthorized: false
                                });
                            }
                        });
                    }
                },
                {
                    route: 'logout',
                    params: [request()],
                    filters: [
                        RequestFilter.checkAuthorization()
                    ],
                    handler: function (request) {

                        var token = RequestUtils.getToken(request);
                        if (token) {

                            return Promise(function (resolve, reject) {

                                AuthSessionProvider.removeAuthSessionByToken(token)
                                    .then(function () {
                                        resolve();
                                    }, function (e) {
                                        reject(e);
                                    });
                            });
                        } else {
                            throw RequestError.badRequest({
                                code: 'AUTHENTICATION.BAD_TOKEN'
                            });
                        }
                    }
                }
            ]
        });
    };

})(require);