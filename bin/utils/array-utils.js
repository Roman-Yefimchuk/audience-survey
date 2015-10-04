"use strict";

(function (require) {

    var _ = require('underscore');

    function select(array, iterator) {
        var result = [];
        _.forEach(array, function (element) {
            result.push(iterator(element));
        });
        return result;
    }

    module.exports = {
        select: select
    };

})(require);