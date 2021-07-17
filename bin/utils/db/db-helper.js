"use strict";

(function (require) {

    var _ = require('underscore');
    var RecordId = require('./record-id');

    function getRecordId(property) {
        if (property) {
            var rid = (property['rid'] || property['@rid']).toString();
            return parseRecordId(rid);
        }
    }

    function parseRecordId(value) {
        return RecordId.parse(value);
    }

    var formatQuery = (function () {

        var singleBracketPattern = new RegExp("'", 'g');
        var isObject = (function () {

            var toString = Object.prototype['toString'];

            return function (value) {
                return toString.call(value) === '[object Object]';
            };
        })();

        function getDictionary(params) {

            var dictionary = {};

            var stack = [
                {
                    $key: '',
                    $value: params
                }
            ];

            while (stack.length > 0) {

                var item = stack.pop();

                var $key = item.$key;
                var $value = item.$value;

                _.forEach($value, function (value, key) {

                    if ($key.length > 0) {
                        key = $key + '.' + key;
                    }

                    if (isObject(value)) {

                        if (value.__monolithic__) {

                            dictionary[key] = value;
                        } else {
                            stack.push({
                                $key: key,
                                $value: value
                            });
                        }

                    } else {
                        dictionary[key] = value;
                    }
                });
            }

            return dictionary;
        }

        return function (query, params) {

            var formattedQuery = query;

            _.forEach(getDictionary(params), function (value, key) {

                if (typeof value != 'undefined') {

                    var pattern = new RegExp(':' + key, 'g');

                    if (typeof value == 'string') {
                        formattedQuery = formattedQuery.replace(pattern, "'" + value.replace(singleBracketPattern, "\\'") + "'");
                    } else {
                        formattedQuery = formattedQuery.replace(pattern, value);
                    }
                }
            });

            return formattedQuery;
        };

    })();

    module.exports = {
        getRecordId: getRecordId,
        parseRecordId: parseRecordId,
        formatQuery: formatQuery
    };

})(require);