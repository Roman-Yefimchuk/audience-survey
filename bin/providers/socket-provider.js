(function (require) {

    var _ = require('underscore');
    var Q = require('q');
    var Promise = Q['promise'];

    var AuthSessionProvider = require('./auth-session-provider');
    var UserRepository = require('./../db/data-access-layers/user-repository');
    var LectureRepository = require('./../db/data-access-layers/lecture-repository');
    var Timer = require('./../utils/timer');

    var SocketSession = (function () {

        function SocketSession(socket, userId) {
            _.extend(this, {
                socket: socket,
                userId: userId
            });
        }

        SocketSession.prototype = {
            constructor: SocketSession,
            emit: function (command, data) {
                var socket = this.socket;
                socket.emit(command, data);

                console.log('command: ' + command + ', data: ' + JSON.stringify(data));
            },
            close: function () {
                var socket = this.socket;
                socket.disconnect();
            }
        };

        return SocketSession;
    })();

    var StatisticChart = (function () {

        function StatisticChart() {
            _.extend(this, {
                chartPoints: [],
                timeline: []
            });
        }

        StatisticChart.prototype = {
            constructor: StatisticChart,
            startRecord: function () {
                this.startTime = _.now();
                this.timeline = [
                    {
                        startTime: _.now(),
                        finishTime: 'expected',
                        status: 'started'
                    }
                ];
            },
            stopRecord: function () {

                var timeline = this.timeline;
                var timeMarker = timeline[timeline.length - 1];
                timeMarker.finishTime = _.now();

                this.finishTime = _.now();
            },
            addTimeMarker: function (timeMarker) {
                var timeline = this.timeline;
                timeline.push(timeMarker);
            },
            addChartPoint: function (chartPoint) {
            }
        };

        return StatisticChart;
    })();

    var ListenerAnswer = (function () {

        function ListenerAnswer(listenerId, answerData) {
            this.listenerId = listenerId;
            this.answerData = answerData;
        }

        ListenerAnswer.prototype = {
            constructor: ListenerAnswer
        };

        return ListenerAnswer;
    })();

    var AskedQuestion = (function () {

        function AskedQuestion(questionId) {
            this.questionId = questionId;
            this.listenerAnswers = [];
        }

        AskedQuestion.prototype = {
            constructor: AskedQuestion
        };

        return AskedQuestion;
    })();

    var ActiveLecture = (function () {

        var activeLectures = [];

        function ActiveLecture(lecture) {

            var io = socketManager.io;
            var connection = io.of('/' + lecture.id);

            var activeLecture = _.extend(this, {
                id: lecture.id,
                lecturer: (function (lecturer) {
                    return {
                        id: lecturer.id,
                        name: lecturer.profile['name']
                    };
                })(lecture.lecturer),
                listeners: [],
                askedQuestions: [],
                statisticChart: new StatisticChart(),
                status: 'stopped',
                timer: new Timer(function () {

                    var duration = activeLecture.getDuration();

                    _.forEach(activeLecture.listeners, function (listener) {
                        var socketSession = listener.socketSession;
                        socketSession.emit('on_lecture_duration_changed', {
                            duration: duration
                        });
                    });

                    _.forEach(observers, function (observer) {
                        observer.emit('on_lecture_duration_changed', {
                            lectureId: activeLecture.id,
                            duration: duration
                        });
                    });
                }, 1000),
                connection: connection
            });

            connection.on('connection', function (socket) {

                var query = socket.handshake['query'];
                var userId = query.userId;

                var socketSession = new SocketSession(socket, userId);

                _.forEach(activeLecture.listeners, function (listener) {
                    var socketSession = listener.socketSession;
                    socketSession.emit('on_listener_joined', {
                        userId: userId
                    });
                });

                _.forEach(observers, function (observer) {
                    observer.emit('on_listener_joined', {
                        lectureId: activeLecture.id,
                        userId: userId
                    });
                });

                var listener = {
                    userId: userId,
                    requestCount: 0,
                    understandingValue: 0,
                    socketSession: socketSession
                };

                var listeners = activeLecture.listeners;
                listeners.push(listener);

                socket.on('send_message', function (data) {

                    _.forEach(activeLecture.listeners, function (listener) {
                        var socketSession = listener.socketSession;
                        socketSession.emit('on_message_received', data);
                    });
                });

                socket.on('update_statistic', function (data) {

                    listener.requestCount++;
                    listener.understandingValue += data.value;

                    var understandingValue = activeLecture.getAverageUnderstandingValue();

                    _.forEach(activeLecture.listeners, function (listener) {
                        var socketSession = listener.socketSession;
                        socketSession.emit('on_statistic_updated', {
                            understandingValue: understandingValue
                        });
                    });
                });

                socket.on('disconnect', function () {

                    socketSession.close();
                    activeLecture.listeners = _.without(activeLecture.listeners, listener);

                    _.forEach(activeLecture.listeners, function (listener) {
                        var socketSession = listener.socketSession;
                        socketSession.emit('on_listener_went', {
                            userId: userId
                        });
                    });

                    _.forEach(observers, function (observer) {
                        observer.emit('on_listener_went', {
                            lectureId: activeLecture.id,
                            userId: userId
                        });
                    });
                });
            });
        }

        ActiveLecture.prototype = {
            constructor: ActiveLecture,
            start: function () {

                this.status = 'started';

                _.forEach([
                    this.timer
                ], function (timer) {
                    timer.start();
                });

                var statisticChart = this.statisticChart;
                statisticChart.startRecord();

                activeLectures.push(this);

                _.forEach(observers, _.bind(function (observer) {
                    observer.emit('on_lecture_started', {
                        lectureId: this.id,
                        lecturer: this.lecturer
                    });
                }, this));
            },
            resume: function () {

                this.status = 'started';

                _.forEach([
                    this.timer
                ], function (timer) {
                    timer.resume();
                });

                var statisticChart = this.statisticChart;

                var timeline = statisticChart.timeline;
                var timeMarker = timeline[timeline.length - 1];
                timeMarker.finishTime = _.now();

                statisticChart.addTimeMarker({
                    startTime: _.now(),
                    finishTime: 'expected',
                    status: 'started'
                });

                _.forEach(this.listeners, function (listener) {
                    var socketSession = listener.socketSession;
                    socketSession.emit('on_lecture_resumed');
                });

                _.forEach(observers, _.bind(function (observer) {
                    observer.emit('on_lecture_resumed', {
                        lectureId: this.id
                    });
                }, this));
            },
            suspend: function () {

                this.status = 'suspended';

                _.forEach([
                    this.timer
                ], function (timer) {
                    timer.suspend();
                });

                var statisticChart = this.statisticChart;

                var timeline = statisticChart.timeline;
                var timeMarker = timeline[timeline.length - 1];
                timeMarker.finishTime = _.now();

                statisticChart.addTimeMarker({
                    startTime: _.now(),
                    finishTime: 'expected',
                    status: 'suspended'
                });

                _.forEach(this.listeners, function (listener) {
                    var socketSession = listener.socketSession;
                    socketSession.emit('on_lecture_suspended');
                });

                _.forEach(observers, _.bind(function (observer) {
                    observer.emit('on_lecture_suspended', {
                        lectureId: this.id
                    });
                }, this));
            },
            stop: function () {

                this.status = 'stopped';

                _.forEach([
                    this.timer
                ], function (timer) {
                    timer.stop();
                });

                var statisticChart = this.statisticChart;
                statisticChart.stopRecord();

                activeLectures = _.without(activeLectures, this);

                _.forEach(this.listeners, function (listener) {
                    var socketSession = listener.socketSession;
                    socketSession.emit('on_lecture_stopped');
                });

                _.forEach(observers, _.bind(function (observer) {
                    observer.emit('on_lecture_stopped', {
                        lectureId: this.id
                    });
                }, this));

                var connection = this.connection;
                var io = socketManager.io;

                delete io.nsps[connection.name];
            },
            getDuration: function () {

                var duration = 0;
                var timeline = this.statisticChart['timeline'];

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
            getAverageUnderstandingValue: function () {

                var value = 0;
                var count = 0;

                _.forEach(this.listeners, function (listener) {
                    if (listener.requestCount > 0) {
                        count++;
                        value += (listener.understandingValue / listener.requestCount);
                    }
                });

                if (count > 0) {
                    return (value / count) * 100;
                }

                return 0;
            },
            toJSON: function () {
                return {
                    id: this.id,
                    lecturer: this.lecturer,
                    duration: this.getDuration(),
                    status: this.status,
                    listeners: (_.bind(function () {
                        var listeners = [];
                        _.forEach(this.listeners, function (listener) {
                            listeners.push(listener.userId);
                        });
                        return listeners;
                    }, this))()
                };
            }
        };

        ActiveLecture.getById = function (lectureId) {
            return _.find(activeLectures, function (activeLecture) {
                return activeLecture.id == lectureId;
            });
        };

        ActiveLecture.getAll = function () {
            return activeLectures;
        };

        ActiveLecture.each = function (callback) {
            _.forEach(activeLectures, callback);
        };

        return ActiveLecture;
    })();

    var observers = [];
    var socketManager = {
        io: null
    };

    function use(io) {

        socketManager.io = io;

        io.use(function (socket, next) {

            var query = socket.handshake['query'];
            var token = query.token;
            var userId = query.userId;

            if (token) {

                AuthSessionProvider.getAuthSessionByToken(token)
                    .then(function (authSession) {

                        if (authSession) {

                            if (userId != authSession.userId) {

                                next(new Error('AUTHENTICATION.FORBIDDEN'));
                            } else {

                                if (_.now() >= authSession.expirationDate) {

                                    AuthSessionProvider.removeAuthSessionByToken(token)
                                        .then(function () {
                                            next(new Error('AUTHENTICATION.TOKEN_EXPIRED'));
                                        })
                                        .catch(function (e) {
                                            next(e);
                                        });
                                } else {

                                    next();
                                }
                            }
                        } else {

                            next(new Error('AUTHENTICATION.BAD_TOKEN'));
                        }
                    }, function (e) {

                        next(e);
                    });
            } else {

                next(new Error('AUTHENTICATION.INVALID_TOKEN'));
            }
        });

        var connection = io.of('/');
        connection.on('connection', function (socket) {

            socket.emit('ok');

            var query = socket.handshake['query'];
            var userId = query.userId;

            var socketSession = new SocketSession(socket, userId);

            observers.push(socketSession);

            socket.on('disconnect', function () {
                socketSession.close();
                observers = _.without(observers, socketSession);
            });
        });
    }

    function startLecture(lectureId) {

        return Promise(function (resolve) {
            LectureRepository.getLecture(lectureId)
                .then(function (lecture) {

                    if (lecture) {

                        new ActiveLecture(lecture).start();

                        resolve('success');
                    } else {

                        resolve('not_found');
                    }

                }, function () {
                    resolve('not_found');
                });
        });
    }

    function suspendLecture(lectureId) {

        return Promise(function (resolve) {

            var activeLecture = ActiveLecture.getById(lectureId);
            if (activeLecture) {

                if (activeLecture.status == 'suspended') {
                    resolve('already_suspended');
                } else {
                    activeLecture.suspend();
                    resolve('success');
                }
            } else {
                resolve('not_found');
            }
        });
    }

    function resumeLecture(lectureId) {

        return Promise(function (resolve) {

            var activeLecture = ActiveLecture.getById(lectureId);
            if (activeLecture) {

                if (activeLecture.status == 'suspended') {
                    activeLecture.resume();
                    resolve('success');
                } else {
                    resolve('not_suspended');
                }
            } else {
                resolve('not_found');
            }
        });
    }

    function stopLecture(lectureId) {

        return Promise(function (resolve) {

            var activeLecture = ActiveLecture.getById(lectureId);
            if (activeLecture) {

                activeLecture.stop();
                resolve('success');
            } else {
                resolve('not_found');
            }
        });
    }

    function getActiveLectures() {

        return Promise(function (resolve) {

            var activeLectures = ActiveLecture.getAll();

            resolve(activeLectures);
        });
    }

    function getActiveLecture(lectureId) {
        return Promise(function (resolve) {
            resolve();
        });
    }

    module.exports = {
        use: use,
        startLecture: startLecture,
        suspendLecture: suspendLecture,
        resumeLecture: resumeLecture,
        stopLecture: stopLecture,
        getActiveLectures: getActiveLectures,
        getActiveLecture: getActiveLecture
    };

})(require);