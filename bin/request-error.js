"use strict";

(function (require) {

    var _ = require('underscore');

    var errorCodes = {
        'AUTHORIZATION': {
            'USER_ALREADY_EXISTS': 'User already exists',
            'INVALID_PASSWORD': 'Invalid password'
        },
        'AUTHENTICATION': {
            'TOKEN_EXPIRED': 'Token expired',
            'BAD_TOKEN': 'Bad token',
            'INVALID_TOKEN': 'Invalid token',
            'FORBIDDEN': 'Forbidden'
        },
        'COMMON': {
            'USER_NOT_FOUND': 'User not found'
        },
        'INVALID_MODEL': 'Invalid model'
    };

    function RequestError(httpCode, message, options) {

        this.httpCode = httpCode;
        this.message = message;

        options = options || {};

        this.code = options.code;
        this.data = options.data;
    }

    RequestError.prototype = {
        toString: function () {
            return this.message;
        }
    };

    var getRequestErrorFactory = (function () {

        function getCodeMessage(code) {

            var path = code.split('.');
            var obj = errorCodes;

            _.forEach(path, function (subPath) {
                if (typeof obj[subPath] != 'undefined') {
                    obj = obj[subPath];
                } else {
                    throw 'Invalid code: ' + code;
                }
            });

            return obj;
        }

        return function (httpCode, message) {

            return function (options) {

                if (typeof options == 'undefined') {
                    return new RequestError(httpCode, message);
                }

                if (options instanceof Error) {
                    return new RequestError(httpCode, options.message || message);
                }

                if (typeof options == 'string') {
                    return new RequestError(httpCode, options || message);
                }

                if (options.code) {
                    return new RequestError(httpCode, getCodeMessage(options.code) || message, {
                        code: options.code,
                        data: options.data || {}
                    });
                }

                return new RequestError(httpCode, message, {
                    data: options.data || {}
                });
            };
        };
    })();

    RequestError.badRequest = getRequestErrorFactory(400, 'Bad request');
    RequestError.unauthorized = getRequestErrorFactory(401, 'Unauthorized');
    RequestError.forbidden = getRequestErrorFactory(403, 'Forbidden');
    RequestError.notFound = getRequestErrorFactory(404, 'Not found');
    RequestError.internalServerError = getRequestErrorFactory(500, 'Internal server error');

    module.exports = RequestError;

})(require);