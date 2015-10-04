"use strict";

angular.module('application')

    .service('socketConnectorService', [

        '$q',
        '$rootScope',
        '$cookies',

        function ($q, $rootScope, $cookies) {

            var SocketEventsListener = (function () {

                function SocketEventsListener() {
                    _.extend(this, {
                        $$listeners: []
                    });
                }

                SocketEventsListener.prototype = {
                    constructor: SocketEventsListener,
                    on: function (obj, listener) {

                        var on = _.bind(function (command) {

                            var namedListeners = this.$$listeners[command];

                            if (!namedListeners) {
                                this.$$listeners[command] = namedListeners = [];
                            }

                            var namedListener = function (data) {
                                listener(data);
                            };

                            namedListeners.push(namedListener);

                            return _.bind(function () {
                                this.$$listeners[command] = _.without(namedListeners, namedListener);
                            }, this);
                        }, this);

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
                    },
                    trigger: function (command, data) {

                        var namedListeners = this.$$listeners[command] || [];

                        _.forEach(namedListeners, function (namedListener) {
                            namedListener(data);
                        });
                    }
                };

                return SocketEventsListener;
            })();

            var openConnection = function (userId, url) {

                return $q(function (resolve) {

                    var socketEventsListener = new SocketEventsListener();
                    var socket = io(location.origin + url, {
                        'forceNew': true,
                        'query': "token=" + $cookies.token + '&userId=' + userId + '&url=' + url
                    });

                    socket.on('disconnect', function (data) {
                        socketEventsListener.trigger('disconnect', data);
                    });

                    socket.on('error', function (error) {
                        socketEventsListener.trigger('error', error);
                    });

                    socket.on('connect', function () {

                        _.forEach([
                            'on_lecture_started',
                            'on_lecture_resumed',
                            'on_lecture_suspended',
                            'on_lecture_stopped',
                            'on_lecture_duration_changed',
                            'on_question_asked',
                            'on_answer_received',
                            'on_listener_joined',
                            'on_listener_went',
                            'on_lecturer_joined',
                            'on_lecturer_went',
                            'on_message_received',
                            'on_statistic_updated',
                            'on_understanding_value_updated'
                        ], function (command) {
                            socket.on(command, function (data) {
                                socketEventsListener.trigger(command, data);
                            });
                        });

                        resolve({
                            on: function (command, listener) {
                                return socketEventsListener.on(command, listener);
                            },
                            emit: function (comamnd, data) {
                                socket.emit(comamnd, data);
                            },
                            close: function () {
                                socket.disconnect();
                            }
                        });
                    });
                });
            };

            return {
                openConnection: openConnection
            };
        }
    ]
);