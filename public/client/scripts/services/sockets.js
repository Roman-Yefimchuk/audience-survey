"use strict";

angular.module('application')

    .service('socketsService', [

        '$rootScope',
        '$log',
        'DEBUG_MODE',

        function ($rootScope, $log, DEBUG_MODE) {

            var socket = null;
            var socketConnection = null;

            var isConnected = false;

            function closeConnection() {
                isConnected = false;

                if (socket) {
                    return socket.close();
                }
            }

            function getSocketConnection(userId, emit) {
                return  {
                    startLecture: function (lectureId) {
                        emit('start_lecture', {
                            userId: userId,
                            lectureId: lectureId
                        });
                    },
                    resumeLecture: function (lectureId) {
                        emit('resume_lecture', {
                            userId: userId,
                            lectureId: lectureId
                        });
                    },
                    suspendLecture: function (lectureId) {
                        emit('suspend_lecture', {
                            userId: userId,
                            lectureId: lectureId
                        });
                    },
                    stopLecture: function (lectureId) {
                        emit('stop_lecture', {
                            userId: userId,
                            lectureId: lectureId
                        });
                    },
                    getLectureDuration: function (lectureId) {
                        emit('get_lecture_duration', {
                            userId: userId,
                            lectureId: lectureId
                        });
                    },
                    getTotalLectureDuration: function (lectureId) {
                        emit('get_total_lecture_duration', {
                            userId: userId,
                            lectureId: lectureId
                        });
                    },
                    askQuestion: function (lectureId, question) {
                        emit('ask_question', {
                            userId: userId,
                            lectureId: lectureId,
                            question: question
                        });
                    },
                    updatePresentListeners: function (lectureId) {
                        emit('update_present_listeners', {
                            userId: userId,
                            lectureId: lectureId
                        });
                    },
                    joinToLecture: function (lectureId) {
                        emit('join_to_lecture', {
                            userId: userId,
                            lectureId: lectureId
                        });
                    },
                    leftFromLecture: function (lectureId) {
                        emit('left_from_lecture', {
                            userId: userId,
                            lectureId: lectureId
                        });
                    },
                    getQuestionInfo: function (lectureId, questionId) {
                        emit('get_question_info', {
                            userId: userId,
                            lectureId: lectureId,
                            questionId: questionId
                        });
                    },
                    replyForTeacherQuestion: function (lectureId, questionId, answer) {
                        emit('reply_for_teacher_question', {
                            userId: userId,
                            lectureId: lectureId,
                            questionId: questionId,
                            answer: answer
                        });
                    },
                    updateStatistic: function (lectureId, value) {
                        emit('update_statistic', {
                            userId: userId,
                            lectureId: lectureId,
                            value: value
                        });
                    },
                    sendMessage: function (lectureId, message) {
                        emit('send_message', {
                            userId: userId,
                            lectureId: lectureId,
                            message: message
                        });
                    }
                };
            }

            return {
                openCollection: function (options, callback) {

                    var url = options.url;
                    var userId = options.userId;

                    if (isConnected) {
                        callback(socketConnection);
                    } else {

                        socket = io(url, {
                            'force new connection': true
                        });

                        var emit = function (command, data) {
                            if (isConnected) {
                                socket.emit(command, data);
                            } else {
                                throw 'Connection closed';
                            }
                        };

                        var on = function (command, handler) {
                            socket.on(command, handler);
                        };

                        _.forEach({

                            'user_connected': 'userConnected',
                            'user_disconnected': 'userDisconnected',

                            'lecture_started': 'lectureStarted',
                            'lecture_resumed': 'lectureResumed',
                            'lecture_suspended': 'lectureSuspended',
                            'lecture_stopped': 'lectureStopped',
                            'update_lecture_duration': 'updateLectureDuration',
                            'update_total_lecture_duration': 'updateTotalLectureDuration',

                            'question_asked': 'questionAsked',
                            'update_question_info': 'updateQuestionInfo',

                            'update_present_listeners': 'updatePresentListeners',
                            'listener_joined': 'listenerJoined',
                            'listener_has_left': 'listenerHasLeft',

                            'on_message': 'onMessage',

                            'update_statistic': 'updateStatistic'

                        }, function (value, command) {
                            on(command, function (data) {
                                $rootScope.$broadcast('socketsService:' + value, data);
                            });
                        });

                        on('connect', function (data) {
                            isConnected = true;

                            emit('user_connection', {
                                userId: userId
                            });

                            socketConnection = getSocketConnection(userId, emit);
                            callback(socketConnection);
                        });

                        on('disconnect', function (data) {
                            if (isConnected) {
                                closeConnection();
                                $rootScope.$broadcast('socketsService:disconnect', data);
                            }
                        });

                        on('error', function (error) {
                            $rootScope.$broadcast('socketsService:error', error);
                        });
                    }
                },
                closeConnection: function () {
                    closeConnection();
                }
            };
        }
    ]
);