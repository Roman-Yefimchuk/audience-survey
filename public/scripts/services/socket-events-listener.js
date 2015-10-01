"use strict";

angular.module("application")

    .factory('socketEventsListenerService', [

        function () {

            var listeners = {};

            function on(obj, listener) {

                function on(command) {

                    var namedListeners = listeners[command];

                    if (!namedListeners) {
                        listeners[command] = namedListeners = [];
                    }

                    var namedListener = function (data) {
                        listener(data);
                    };

                    namedListeners.push(namedListener);

                    return function () {
                        listeners[command] = _.without(namedListeners, namedListener);
                    };
                }

                if (obj instanceof Array) {

                    return (function (commands) {

                        var removeCallbacks = [];

                        _.forEach(commands, function (command) {
                            var removeCallback = on(command);
                            removeCallbacks.push(removeCallback);
                        });

                        return function () {
                            _.forEach(removeCallbacks, function (removeCallback) {
                                removeCallback();
                            });
                        };
                    })(obj);
                }

                return (function (command) {

                    return on(command);
                })(obj);
            }

            function trigger(command, data) {

                var namedListeners = listeners[command] || [];

                _.forEach(namedListeners, function (namedListener) {
                    namedListener(data);
                });
            }

            return {
                on: on,
                trigger: trigger
            };
        }
    ]);