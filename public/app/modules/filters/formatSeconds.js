"use strict";

angular.module('filters.formatSeconds', [])

    .filter("formatSeconds", [

        function () {

            return function (seconds) {

                if (seconds == 1) {
                    return '1 секунда';
                }

                if (seconds >= 2 && seconds <= 4) {
                    return seconds + ' секунди';
                }

                return seconds + ' секунд';
            };
        }
    ]);