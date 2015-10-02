(function (require, module) {

    var _ = require('underscore');
    var Q = require('q');
    var Promise = Q['promise'];

    var RequestError = require('./request-error');
    var ControllerUtils = require('./utils/controller-utils');
    var ModelValidatorEngine = require('./model-validator-engine');

    function asPromise(func) {

        var object = func();

        if (Q.isPromise(object)) {
            return object;
        } else {
            return Q.when(object);
        }
    }

    function applyRequestFilters(request, filters) {

        if (filters.length > 0) {

            var filterIndex = 0;

            return Promise(function (resolve, reject) {

                var applyNextRequestFilter = function () {
                    if (filterIndex == filters.length) {
                        resolve();
                    } else {
                        asPromise(function () {
                            var filter = filters[filterIndex++];
                            return filter.invoke(request);
                        }).then(function () {
                            applyNextRequestFilter();
                        }).catch(function (e) {
                            reject(e);
                        });
                    }
                };

                applyNextRequestFilter();
            });
        } else {
            return Q.when();
        }
    }

    function sendSuccess(response, data) {

        process.nextTick(function () {

            response.status(200);
            response.json(data);
        });
    }

    function sendError(response, error) {

        error = error || RequestError.internalServerError();

        if (!(error instanceof RequestError)) {
            if (error instanceof Error) {
                error = RequestError.internalServerError(error);
            } else {
                error = RequestError.internalServerError(error || '');
            }
        }

        process.nextTick(function () {

            response.status(error.httpCode);
            response.json({
                code: error.code,
                message: error.message,
                data: error.data
            });
        });
    }

    function normalizeRoute(route) {

        if (/^\/.*$/.test(route)) {

            return route.replace(/^\/(.*)$/, function (text, route) {

                return route;
            });
        }

        return route;
    }

    module.exports = function (app) {

        return function (options) {

            var routePrefix = normalizeRoute(options.routePrefix || '');
            var actions = options.actions || [];

            _.forEach(actions, function (action) {

                var params = action.params || [];

                var getActionArguments = (function () {

                    if (params.length > 0) {

                        var resolvers = [];

                        _.forEach(params, function (param) {

                            if (typeof param == 'string') {

                                var paramName = param;

                                resolvers.push(function (request) {
                                    return request.params[paramName];
                                });
                            } else {

                                if (param instanceof ControllerUtils.RequestResolver) {

                                    var requestResolver = param;

                                    resolvers.push(function (request) {
                                        return requestResolver.resolve(request);
                                    });
                                } else {

                                    if (param instanceof ControllerUtils.ResponseResolver) {

                                        var responseResolver = param;

                                        resolvers.push(function (request, response) {
                                            return responseResolver.resolve(response);
                                        });
                                    } else {

                                        throw new Error('Invalid param: ' + param);
                                    }
                                }
                            }

                        });

                        return function (request, response) {

                            var actionArguments = [];

                            _.forEach(resolvers, function (resolve) {
                                var value = resolve(request, response);
                                actionArguments.push(value);
                            });

                            return actionArguments;
                        }
                    }

                    return function () {
                        return [];
                    };
                })();

                var route = normalizeRoute(action.route || '');
                var method = (action.method || 'get').toLowerCase();
                var modelValidator = (function () {

                    if (method == 'post' || method == 'put') {

                        var validationStrategy = action.validationStrategy;
                        if (validationStrategy) {

                            if (validationStrategy instanceof ModelValidatorEngine.ValidationStrategy) {
                                return {
                                    validate: function (model) {
                                        return new ModelValidatorEngine(model, validationStrategy).validate();
                                    }
                                };
                            }

                            throw new TypeError('Invalid validation strategy');
                        }
                    }
                })();
                var filters = action.filters || [];
                var handler = action.handler;

                app[method]((function () {

                    var _route = (function () {

                        if (route) {

                            if (/^\~.*$/.test(route)) {
                                return route.replace(/^\~(.*)$/, function (text, route) {
                                    return route;
                                });
                            }

                            if (routePrefix) {
                                return '/' + routePrefix + '/' + route;
                            }

                            return '/' + route;
                        }

                        return '/' + routePrefix;
                    })();

                    return _route;

                })(), (function () {

                    function invokeHandler(request, response, next) {

                        if (modelValidator) {

                            var model = request.body || {};
                            var errors = modelValidator.validate(model);

                            if (errors) {

                                sendError(response, RequestError.badRequest({
                                    code: 'INVALID_MODEL',
                                    data: errors
                                }));

                                return;
                            }
                        }

                        asPromise(function () {

                            return handler.apply({
                                request: request,
                                response: response,
                                next: next
                            }, getActionArguments(request, response));

                        }).then(function (data) {

                            sendSuccess(response, data);
                        }).catch(function (e) {

                            sendError(response, e);
                        });
                    }

                    return function (request, response, next) {
                        applyRequestFilters(request, filters)
                            .then(function () {
                                invokeHandler(request, response, next);
                            })
                            .catch(function (e) {
                                sendError(response, e);
                            });
                    };
                })());
            });
        };
    };

})(require, module);