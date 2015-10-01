"use strict";

(function (require) {

    var _ = require('underscore');

    function resolveObject(object, path) {

        var result = object;

        if (path.length > 0) {

            var parts = path.split('.');

            _.forEach(parts, function (part) {

                if (typeof result[part] == 'undefined' || result[part] == null) {
                    return result[part];
                }

                result = result[part];
            });
        }

        return result;
    }

    module.exports = {
        resolveObject: resolveObject
    };

})(require);