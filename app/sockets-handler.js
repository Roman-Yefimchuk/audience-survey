"use strict";

module.exports = function (io, dbProvider) {

    var _ = require('underscore');
    var socketsSession = {};
    var activeLectures = {};

    var SocketSession = (function () {

        var closedCounter = 0;

        function SocketSession(socket, userId) {
            this.socket = socket;
            this.userId = userId;
        }

        SocketSession.prototype = {
            sendCommand: function (command, data) {
                var socket = this.socket;
                socket.emit(command, data);
            },
            close: function () {
                var socket = this.socket;

                socketsSession[socket.id] = null;
                socket.disconnect();

                if (++closedCounter > 25) {
                    socketsSession = _.compact(socketsSession);
                    closedCounter = 0;
                }
            }
        };

        return SocketSession;
    })();

    var Lecture = (function () {

        var stopCounter = 0;

        var startTimer = (function () {

            function getPresentListeners(context) {
                var lectureId = context.id;
                var count = 0;

                _.forEach(socketsSession, function (socketSession) {
                    if (socketSession && socketSession.lectureId == lectureId) {
                        count++;
                    }
                });

                return count;
            }

            function timerHandler() {
                var timeline = this.timeline;
                var timeMarker = timeline[timeline.length - 1];

                var finishTime = timeMarker.finishTime;
                if (finishTime == 'expected') {
                    finishTime = _.now();
                }

                if (Math.floor((finishTime - _.now()) / 1000) <= 60) {
                    var chartPoints = this.chartPoints;
                    chartPoints.push({
                        timestamp: this.getTotalDuration(),
                        presentListeners: getPresentListeners(this),
                        understandingPercentage: this.getAverageUnderstandingValue()
                    });
                    this.updateChart();
                }
            }

            return function (context) {
                context.timerId = setInterval(function () {
                    timerHandler.call(context);
                }, 1000 * 60);
            }
        })();

        var stopTimer = function (context) {
            var timerId = context.timerId;
            if (timerId) {
                clearInterval(timerId);
                context.timerId = null;
            }
        };

        function Lecture(id, starterId) {
            this.starterId = starterId;
            this.id = id;
            this.timeline = [];
            this.status = 'stopped';
            this.teacherQuestions = {};
            this.timerId = null;
            this.chartPoints = [];
        }

        Lecture.prototype = {
            runLecture: function (onStartedCallback) {
                var context = this;

                context.status = 'started';

                var id = context.id;
                var timeline = context.timeline;
                timeline.push({
                    startTime: _.now(),
                    finishTime: 'expected',
                    status: 'started'
                });

                activeLectures[id] = context;

                startTimer(context);

                dbProvider.updateLectureStatus(id, 'started', {
                    success: function () {
                        onStartedCallback(context);
                    },
                    failure: function (error) {
                        console.log(error);
                    }
                });
            },
            resumeLecture: function (onResumeCallback) {
                var context = this;

                context.status = 'started';

                var id = context.id;
                var timeline = context.timeline;
                var timeMarker = timeline[timeline.length - 1];
                timeMarker.finishTime = _.now();

                timeline.push({
                    startTime: _.now(),
                    finishTime: 'expected',
                    status: 'started'
                });

                startTimer(context);

                dbProvider.updateLectureStatus(id, 'started', {
                    success: function () {
                        onResumeCallback(context);
                    },
                    failure: function (error) {
                        console.log(error);
                    }
                });
            },
            suspendLecture: function (onSuspendedCallback) {
                var context = this;

                context.status = 'suspended';

                var id = context.id;
                var timeline = context.timeline;
                var timeMarker = timeline[timeline.length - 1];
                timeMarker.finishTime = _.now();

                timeline.push({
                    startTime: _.now(),
                    finishTime: 'expected',
                    status: 'suspended'
                });

                stopTimer(context);

                dbProvider.updateLectureStatus(id, 'suspended', {
                    success: function () {
                        onSuspendedCallback(context);
                    },
                    failure: function (error) {
                        console.log(error);
                    }
                });
            },
            stopLecture: function (onStoppedCallback) {
                var context = this;

                context.status = 'stopped';

                var id = context.id;
                activeLectures[id] = null;

                if (++stopCounter > 25) {
                    activeLectures = _.compact(activeLectures);
                    stopCounter = 0;
                }

                var timeline = context.timeline;
                var timeMarker = timeline[timeline.length - 1];
                timeMarker.finishTime = _.now();

                stopTimer(context);

                dbProvider.updateLectureStatus(id, 'stopped', {
                    success: function () {

                        var lectureId = context.id;
                        var chartPoints = context.chartPoints;
                        var timeline = context.timeline;

                        dbProvider.saveStatisticForLecture(lectureId, {
                            date: context.getDate(),
                            chartPoints: chartPoints,
                            timeline: timeline,
                            totalDuration: context.getTotalDuration()
                        }, {
                            success: function () {
                                onStoppedCallback(context);
                            },
                            failure: function (error) {
                                console.log(error);
                            }
                        });
                    },
                    failure: function (error) {
                        console.log(error);
                    }
                });
            },
            getDuration: function () {

                var duration = 0;
                var timeline = this.timeline;
                _.forEach(timeline, function (timeMarker) {

                    if (timeMarker.status == 'started') {

                        var startTime = timeMarker.startTime;
                        var finishTime = timeMarker.finishTime;

                        if (finishTime == 'expected') {
                            finishTime = _.now();
                        }

                        duration += (finishTime - startTime);
                    }
                });

                return Math.floor(duration / 1000);
            },
            getTotalDuration: function () {

                var timeline = this.timeline;
                var startTime = timeline[0].startTime;
                var finishTime = timeline[timeline.length - 1].finishTime;
                if (finishTime == 'expected') {
                    finishTime = _.now();
                }

                return Math.floor((finishTime - startTime) / 1000);
            },
            getDate: function () {
                var timeline = this.timeline;
                return Math.floor(timeline[0].startTime / 1000);
            },
            getAverageUnderstandingValue: function () {
                var lectureId = this.id;

                var value = 0;
                var count = 0;

                _.forEach(socketsSession, function (socketSession) {
                    if (socketSession && socketSession.lectureId == lectureId) {
                        if (socketSession.requestCount > 0) {
                            count++;
                            value += (socketSession.understandingValue / socketSession.requestCount);
                        }
                    }
                });

                if (count > 0) {
                    return ((value / count) * 100).toFixed(1);
                }

                return (0).toFixed(1);
            },
            updateChart: function () {
                var chartPoints = this.chartPoints;
                var starterId = this.starterId;

                var socketSession = findSocketSessionByUserId(starterId);
                if (socketSession) {
                    socketSession.sendCommand('update_chart', chartPoints);
                }
            }
        };

        return Lecture;

    })();

    function findSocketSessionByUserId(userId) {
        return _.findWhere(socketsSession, {
            userId: userId
        });
    }

    function findLectureById(lectureId) {
        return activeLectures[lectureId];
    }

    io.on('connection', function (socket) {

        function getSession() {
            return socketsSession[socket.id];
        }

        function createSession(userId) {
            var socketSession = new SocketSession(socket, userId);
            socketsSession[socket.id] = socketSession;
            return socketSession;
        }

        function sendBroadcast(command, data, lectureId) {
            _.forEach(socketsSession, function (socketSession, sessionId) {
                if (socketSession && sessionId != socket.id) {
                    if (lectureId) {
                        if (socketSession.lectureId == lectureId) {
                            socketSession.sendCommand(command, data);
                        }
                    } else {
                        socketSession.sendCommand(command, data);
                    }
                }
            });
        }

        function emit(command, data) {
            socket.emit(command, data);
        }

        function on(command, callback) {
            socket.on(command, function (data) {
                callback(data);
            });
        }

        on('user_connection', function (data) {

            var userId = data.userId;

            createSession(userId);

            emit('user_connected');
        });

        on('disconnect', function () {
            var session = getSession();
            if (session) {
                var userId = session.userId;

                sendBroadcast('user_disconnected', {
                    userId: userId,
                    lectureId: session.lectureId
                });

                session.close();
            }
        });

        on('start_lecture', function (data) {
            var lectureId = data.lectureId;
            var lecture = new Lecture(lectureId, data.userId);
            lecture.runLecture(function (lecture) {

                var session = getSession();
                session.sendCommand('lecture_started', {
                    lectureId: lectureId
                });

                sendBroadcast('lecture_started', {
                    lectureId: lectureId
                });
            });
        });

        on('resume_lecture', function (data) {
            var lectureId = data.lectureId;
            var lecture = findLectureById(lectureId);
            if (lecture) {
                lecture.resumeLecture(function (lecture) {

                    var session = getSession();
                    session.sendCommand('lecture_resumed', {
                        lectureId: lectureId
                    });

                    sendBroadcast('lecture_resumed', {
                        lectureId: lectureId
                    });
                });
            }
        });

        on('suspend_lecture', function (data) {
            var lectureId = data.lectureId;
            var lecture = findLectureById(lectureId);
            if (lecture) {
                lecture.suspendLecture(function (lecture) {

                    var session = getSession();
                    session.sendCommand('lecture_suspended', {
                        lectureId: lectureId
                    });

                    sendBroadcast('lecture_suspended', {
                        lectureId: lectureId
                    });
                });
            }
        });

        on('stop_lecture', function (data) {

            var lectureId = data.lectureId;
            var lecture = findLectureById(lectureId);

            if (lecture) {
                lecture.stopLecture(function (lecture) {

                    var session = getSession();
                    session.sendCommand('lecture_stopped', {
                        lectureId: lectureId
                    });

                    sendBroadcast('lecture_stopped', {
                        lectureId: lectureId
                    });
                });
            }
        });

        on('get_lecture_duration', function (data) {

            var userId = data.userId;
            var lectureId = data.lectureId;

            var lecture = findLectureById(lectureId);
            var socketSession = findSocketSessionByUserId(userId);

            if (lecture && socketSession) {
                socketSession.sendCommand('update_lecture_duration', {
                    lectureId: lectureId,
                    duration: lecture.getDuration()
                });
            }
        });

        on('get_total_lecture_duration', function (data) {

            var userId = data.userId;
            var lectureId = data.lectureId;

            var lecture = findLectureById(lectureId);
            var socketSession = findSocketSessionByUserId(userId);

            if (lecture && socketSession) {
                socketSession.sendCommand('update_total_lecture_duration', {
                    lectureId: lectureId,
                    totalDuration: lecture.getTotalDuration()
                });
            }
        });

        on('get_total_lecture_duration', function (data) {

            var userId = data.userId;
            var lectureId = data.lectureId;

            var lecture = findLectureById(lectureId);
            var socketSession = findSocketSessionByUserId(userId);

            if (lecture && socketSession) {
                socketSession.sendCommand('update_total_lecture_duration', {
                    lectureId: lectureId,
                    totalDuration: lecture.getTotalDuration()
                });
            }
        });

        on('get_question_info', function (data) {

            var userId = data.userId;
            var lectureId = data.lectureId;
            var questionId = data.questionId;

            var lecture = findLectureById(lectureId);
            var socketSession = findSocketSessionByUserId(userId);

            if (lecture && socketSession) {

                var question = lecture.teacherQuestions[questionId];
                if (question) {
                    socketSession.sendCommand('update_question_info', {
                        isAsked: true,
                        questionId: questionId,
                        answers: question.answers
                    });
                } else {
                    socketSession.sendCommand('update_question_info', {
                        isAsked: false,
                        questionId: questionId
                    });
                }
            }
        });

        on('send_message', function (data) {

            var userId = data.userId;
            var lectureId = data.lectureId;
            var message = data.message;

            var lecture = findLectureById(lectureId);

            if (lecture) {
                sendBroadcast('on_message', {
                    userId: userId,
                    message: message
                });
            }
        });

        on('reply_for_teacher_question', function (data) {

            var userId = data.userId;
            var lectureId = data.lectureId;
            var questionId = data.questionId;
            var answer = data.answer;

            var lecture = findLectureById(lectureId);
            if (lecture) {

                var question = lecture.teacherQuestions[questionId];

                if (question) {
                    var answers = question.answers;
                    answers.push({
                        userId: userId,
                        answer: answer
                    });
                } else {
                    question = {
                        answers: [
                            {
                                userId: userId,
                                answer: answer
                            }
                        ]
                    };
                    lecture.teacherQuestions[questionId] = question;
                }

                sendBroadcast('update_question_info', {
                    isAsked: true,
                    questionId: questionId,
                    answers: question.answers
                }, lectureId);

                dbProvider.getLectureById(lectureId, {
                    success: function (lecture) {
                        var authorId = lecture.authorId;

                        var socketSession = findSocketSessionByUserId(authorId);
                        if (socketSession) {
                            socketSession.sendCommand('update_question_info', {
                                isAsked: true,
                                questionId: questionId,
                                answers: question.answers
                            });
                        }
                    },
                    failure: function (error) {
                        console.log(error);
                    }
                });
            }
        });

        on('ask_question', function (data) {

            var userId = data.userId;
            var lectureId = data.lectureId;
            var question = data.question;

            var lecture = findLectureById(lectureId);
            if (lecture) {
                var questionId = question.id;

                if (!lecture.teacherQuestions[questionId]) {
                    lecture.teacherQuestions[questionId] = {
                        isAsked: true,
                        answers: []
                    };
                }

                sendBroadcast('question_asked', {
                    lectureId: lectureId,
                    question: question
                }, lectureId);
            }
        });

        on('update_present_listeners', function (data) {
            var userId = data.userId;
            var lectureId = data.lectureId;

            var presentListeners = [];

            _.forEach(socketsSession, function (socketSession) {
                if (socketSession && socketSession.lectureId == lectureId) {
                    var userId = socketSession.userId;
                    presentListeners.push(userId);
                }
            });

            emit('update_present_listeners', {
                lectureId: lectureId,
                presentListeners: presentListeners
            });
        });

        on('update_statistic', function (data) {
            var userId = data.userId;
            var lectureId = data.lectureId;
            var value = data.value;

            var session = findSocketSessionByUserId(userId);
            if (session) {
                session.requestCount++;
                session.understandingValue += value;
            }

            var lecture = findLectureById(lectureId);

            var response = {
                lectureId: lectureId,
                understandingValue: lecture.getAverageUnderstandingValue()
            };

            sendBroadcast('update_statistic', response);
            emit('update_statistic', response);
        });

        on('join_to_lecture', function (data) {
            var userId = data.userId;
            var lectureId = data.lectureId;

            var session = findSocketSessionByUserId(userId);
            if (session) {
                session.lectureId = lectureId;
                session.requestCount = 0;
                session.understandingValue = 0;
            }

            sendBroadcast('listener_joined', {
                userId: userId,
                lectureId: lectureId
            });
        });

        on('left_from_lecture', function (data) {
            var userId = data.userId;
            var lectureId = data.lectureId;

            var session = findSocketSessionByUserId(userId);
            if (session) {
                session.lectureId = null;
                session.requestCount = null;
                session.understandingValue = null;
            }

            sendBroadcast('listener_has_left', {
                userId: userId,
                lectureId: lectureId
            });
        });

        on('update_chart', function (data) {
            var lectureId = data.lectureId;
            var lecture = findLectureById(lectureId);
            if (lecture) {
                lecture.updateChart();
            }
        });
    });
};