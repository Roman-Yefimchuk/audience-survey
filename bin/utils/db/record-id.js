"use strict";

module.exports = (function () {

    function RecordId(rid) {
        this.rid = rid;
    }

    RecordId.prototype = {
        toString: function () {
            return '#' + this.rid;
        },
        toJSON: function () {
            return this.rid;
        },
        valueOf: function () {
            return this.rid;
        }
    };

    RecordId.parse = function (value) {

        if (value instanceof RecordId) {

            return value;
        }

        if (/^\-?\d+\:\d+$/.test(value)) {

            return new RecordId(value);
        } else {

            if (/^\#\-?\d+\:\d+$/.test(value)) {

                value = value.replace(/^\#(\-?\d+)\:(\d+)$/, function (s, cluster, position) {
                    return cluster + ':' + position;
                });

                return new RecordId(value);
            } else {

                throw 'Invalid @rid format:' + value;
            }
        }
    };

    Object.defineProperty(RecordId.prototype, '__monolithic__', {
        value: true,
        writable: false,
        configurable: false,
        enumerable: false
    });

    return RecordId;

})();