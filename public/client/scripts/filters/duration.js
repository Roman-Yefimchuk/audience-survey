"use strict";

angular.module('application')

    .filter("duration", [

        function () {

            function formatNumber(n) {
                if (n < 10) {
                    return '0' + n;
                }
                return '' + n;
            }

            return function (delay) {
                if (delay < 60) {
                    return '00:00:' + formatNumber(delay);
                } else {
                    if (delay < 60 * 60) {
                        var minutes = Math.floor(delay / 60);
                        return '00:' + formatNumber(minutes) + ':' + formatNumber(delay - ((minutes * 60)))
                    }
                }
            };
        }
    ]);