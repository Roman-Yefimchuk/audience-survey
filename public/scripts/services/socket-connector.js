"use strict";

angular.module('application')

    .service('socketConnectorService', [

        '$q',
        '$rootScope',
        '$cookies',
        'socketEventsListenerService',

        function ($q, $rootScope, $cookies, socketEventsListenerService) {

            var openConnection = function (userId, url) {

                return $q(function (resolve) {

                    var socket = io(url, {
                        'force new connection': true,
                        'query': "token=" + $cookies.token + '&userId=' + userId
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
                            'on_message_received',
                            'on_chart_value_changed',
                            'on_average_understanding_value_changed'
                        ], function (command) {

                            socket.on(command, function (data) {
                                socketEventsListenerService.trigger(command, data);
                            });
                        });

                        function socketEventsListener() {
                            socket.close();
                        }

                        socketEventsListener.on = socketEventsListenerService.on;
                        socketEventsListener.trigger = socketEventsListenerService.trigger;

                        resolve(socketEventsListener);
                    });

                    socket.on('disconnect', function (data) {

                        socket.close();
                        socketEventsListenerService.trigger('disconnect', data);
                    });

                    socket.on('error', function (error) {
                        socketEventsListenerService.trigger('error', error);
                    });
                });
            };

            return {
                openConnection: openConnection
            };
        }
    ]
);