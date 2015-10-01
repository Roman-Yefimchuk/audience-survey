"use strict";

angular.module("application")

    .factory('socketEventsManagerService', [

        function () {

            function subscribe(scope, eventRemoveCallbacks) {
                scope.$on('$destroy', function () {
                    _.forEach(eventRemoveCallbacks, function (eventRemoveCallback) {
                        eventRemoveCallback();
                    });
                });
            }

            return {
                subscribe: subscribe
            };
        }
    ]);