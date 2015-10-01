"use strict";

(function (require) {

    var CommonUtils = require('./common-utils');

    function RequestResolver(path, preProcess) {
        this.path = path || '';
        this.preProcess = preProcess || function (object) {
            return object;
        };
    }

    RequestResolver.prototype = {
        resolve: function (request) {
            var object = CommonUtils.resolveObject(request, this.path);
            return this.preProcess(object);
        }
    };

    function ResponseResolver(path, preProcess) {
        this.path = path || '';
        this.preProcess = preProcess || function (object) {
            return object;
        };
    }

    ResponseResolver.prototype = {
        resolve: function (response) {
            var object = CommonUtils.resolveObject(response, this.path);
            return this.preProcess(object);
        }
    };

    module.exports = {
        RequestResolver: RequestResolver,
        ResponseResolver: ResponseResolver
    };

})(require);