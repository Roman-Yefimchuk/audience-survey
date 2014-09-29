"use strict";

module.exports = function (io, dbProvider, developmentMode) {

    var _ = require('underscore');
    var socketsSession = {};
    var activeLectures = {};
    var forEach = _.forEach;

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

        function Lecture(id) {
            this.id = id;
            this.timeline = [];
            this.status = 'stopped';
        }

        Lecture.prototype = {
            runLecture: function (onStartedCallback) {
                this.status = 'started';

                var id = this.id;
                var timeline = this.timeline;
                timeline.push({
                    startTime: _.now(),
                    finishTime: 'expected',
                    status: 'started'
                });

                activeLectures[id] = this;

                dbProvider.updateLectureStatus(id, 'started', function () {
                    onStartedCallback(this);
                });
            },
            resumeLecture: function (onResumeCallback) {
                this.status = 'started';

                var id = this.id;
                var timeline = this.timeline;
                var timeMarker = timeline[timeline.length - 1];
                timeMarker.finishTime = _.now();

                timeline.push({
                    startTime: _.now(),
                    finishTime: 'expected',
                    status: 'started'
                });

                dbProvider.updateLectureStatus(id, 'started', function () {
                    onResumeCallback(this);
                });
            },
            suspendLecture: function (onSuspendedCallback) {
                this.status = 'suspended';

                var id = this.id;
                var timeline = this.timeline;
                var timeMarker = timeline[timeline.length - 1];
                timeMarker.finishTime = _.now();

                timeline.push({
                    startTime: _.now(),
                    finishTime: 'expected',
                    status: 'suspended'
                });

                dbProvider.updateLectureStatus(id, 'suspended', function () {
                    onSuspendedCallback(this);
                });
            },
            stopLecture: function (onStoppedCallback) {
                this.status = 'stopped';

                var id = this.id;
                activeLectures[id] = null;

                if (++stopCounter > 25) {
                    activeLectures = _.compact(activeLectures);
                    stopCounter = 0;
                }

                var timeline = this.timeline;
                var timeMarker = timeline[timeline.length - 1];
                timeMarker.finishTime = _.now();

                dbProvider.updateLectureStatus(id, 'stopped', function () {
                    onStoppedCallback(this);
                });
            },
            getDuration: function () {

                var duration = 0;
                var timeline = this.timeline;
                forEach(timeline, function (timeMarker) {

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
            forEach(socketsSession, function (socketSession, sessionId) {
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
            var lecture = new Lecture(lectureId);
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

        on('ask_question', function (data) {

            var lectureId = data.lectureId;
            var question = data.question;

            sendBroadcast('question_asked', {
                lectureId: lectureId,
                question: question
            });
        });

        on('update_present_listeners', function (data) {
            var userId = data.userId;
            var lectureId = data.lectureId;

            var presentListeners = [];

            forEach(socketsSession, function (socketSession) {
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

        on('join_to_lecture', function (data) {
            var userId = data.userId;
            var lectureId = data.lectureId;

            var session = findSocketSessionByUserId(userId);
            if (session) {
                session.lectureId = lectureId;
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
            }

            sendBroadcast('listener_has_left', {
                userId: userId,
                lectureId: lectureId
            });
        });
    });
};