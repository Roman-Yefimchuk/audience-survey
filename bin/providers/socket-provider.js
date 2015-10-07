(function (require) {

    var TIMER_INTERVAL = 1000;
    var UPDATE_STATISTIC_INTERVAL = 60;

    var _ = require('underscore');
    var Q = require('q');
    var Promise = Q['promise'];

    var AuthSessionProvider = require('./auth-session-provider');
    var StatisticChartRepository = require('./../db/data-access-layers/statistic-chart-repository');
    var LectureRepository = require('./../db/data-access-layers/lecture-repository');
    var Timer = require('./../utils/timer');
    var ArrayUtils = require('./../utils/array-utils');

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
                /*
                 console.log('command: ' + command + ', data: ' + JSON.stringify(data));*/
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
                timeline: [],
                startTime: -1,
                finishTime: -1
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
                var chartPoints = this.chartPoints;
                chartPoints.push(chartPoint);
            },
            toJSON: function () {
                return {
                    chartPoints: this.chartPoints,
                    timeline: this.timeline,
                    startTime: this.startTime,
                    finishTime: this.finishTime
                };
            }
        };

        return StatisticChart;
    })();

    var ListenerAnswer = (function () {

        function ListenerAnswer(userId, answerData) {
            this.userId = userId;
            this.answerData = answerData;
        }

        ListenerAnswer.prototype = {
            constructor: ListenerAnswer,
            toJSON: function () {
                return {
                    userId: this.userId,
                    answerData: this.answerData
                };
            }
        };

        return ListenerAnswer;
    })();

    var AskedQuestion = (function () {

        function AskedQuestion(questionId) {
            this.questionId = questionId;
            this.listenerAnswers = [];
        }

        AskedQuestion.prototype = {
            constructor: AskedQuestion,
            addListenerAnswer: function (userId, answerData) {
                var listenerAnswers = this.listenerAnswers;
                listenerAnswers.push(new ListenerAnswer(userId, answerData));
            },
            toJSON: function () {
                return {
                    questionId: this.questionId,
                    listenerAnswers: this.listenerAnswers
                };
            }
        };

        return AskedQuestion;
    })();

    var ActiveLecture = (function () {

        function ActiveLecture(lecture) {

            var io = socketManager.io;
            var connection = io.of('/lectures/' + lecture.id);

            var activeLecture = _.extend(this, {
                id: lecture.id,
                name: lecture.name,
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

                    var lecturerSocketSession = activeLecture.lecturerSocketSession;
                    if (lecturerSocketSession) {
                        lecturerSocketSession.emit('on_lecture_duration_changed', {
                            duration: duration
                        });
                    }

                    if (duration % UPDATE_STATISTIC_INTERVAL == 0) {

                        var statisticChart = activeLecture.statisticChart;
                        statisticChart.addChartPoint({
                            timestamp: activeLecture.getDuration(),
                            presentListeners: activeLecture.listeners['length'],
                            understandingPercentage: activeLecture.getAverageUnderstandingValue()
                        });
                    }
                }, TIMER_INTERVAL),
                connection: connection,
                lecturerSocketSession: null
            });

            connection.on('connection', function (socket) {

                var query = socket.handshake['query'];
                var userId = query.userId;

                var socketSession = new SocketSession(socket, userId);

                if (userId == lecture.lecturer['id']) {

                    _.forEach(activeLecture.listeners, function (listener) {
                        var socketSession = listener.socketSession;
                        socketSession.emit('on_lecturer_joined');
                    });

                    _.forEach(observers, function (observer) {
                        observer.emit('on_lecturer_joined', {
                            lectureId: activeLecture.id
                        });
                    });

                    activeLecture.lecturerSocketSession = socketSession;

                    socket.on('ask_question', function (data) {

                        var question = data.question;

                        activeLecture.addAskedQuestion(question.id);

                        _.forEach(activeLecture.listeners, function (listener) {
                            var socketSession = listener.socketSession;
                            socketSession.emit('on_question_asked', {
                                question: question
                            });
                        });
                    });
                } else {

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

                    var lecturerSocketSession = activeLecture.lecturerSocketSession;
                    if (lecturerSocketSession) {
                        lecturerSocketSession.emit('on_listener_joined', {
                            userId: userId
                        });
                    }

                    var listener = {
                        userId: userId,
                        requestCount: 0,
                        understandingValue: 0,
                        socketSession: socketSession
                    };

                    var listeners = activeLecture.listeners;
                    listeners.push(listener);

                    socket.on('update_understanding_value', function (data) {

                        listener.requestCount++;
                        listener.understandingValue += data.value;

                        var understandingValue = activeLecture.getAverageUnderstandingValue();

                        _.forEach(activeLecture.listeners, function (listener) {
                            var socketSession = listener.socketSession;
                            socketSession.emit('on_understanding_value_updated', {
                                understandingValue: understandingValue
                            });
                        });

                        var lecturerSocketSession = activeLecture.lecturerSocketSession;
                        if (lecturerSocketSession) {
                            lecturerSocketSession.emit('on_understanding_value_updated', {
                                understandingValue: understandingValue
                            });
                        }
                    });

                    socket.on('send_answer', function (data) {

                        var questionId = data.questionId;
                        var answerData = data.answerData;

                        if (activeLecture.addListenerAnswer(userId, questionId, answerData)) {

                            lecturerSocketSession = activeLecture.lecturerSocketSession;
                            if (lecturerSocketSession) {
                                lecturerSocketSession.emit('on_answer_received', {
                                    userId: userId,
                                    questionId: questionId,
                                    answerData: answerData
                                });
                            }
                        }
                    });
                }

                socket.on('send_message', function (data) {

                    _.forEach(activeLecture.listeners, function (listener) {
                        var socketSession = listener.socketSession;
                        socketSession.emit('on_message_received', data);
                    });

                    var lecturerSocketSession = activeLecture.lecturerSocketSession;
                    if (lecturerSocketSession) {
                        lecturerSocketSession.emit('on_message_received', data);
                    }
                });

                socket.on('joined', function () {
                    socketSession.emit('on_understanding_value_updated', {
                        understandingValue: activeLecture.getAverageUnderstandingValue()
                    });
                });

                socket.on('disconnect', function () {

                    socketSession.close();

                    if (userId == lecture.lecturer['id']) {

                        activeLecture.lecturerSocketSession = null;

                        _.forEach(activeLecture.listeners, function (listener) {
                            var socketSession = listener.socketSession;
                            socketSession.emit('on_lecturer_went');
                        });

                        _.forEach(observers, function (observer) {
                            observer.emit('on_lecturer_went', {
                                lectureId: activeLecture.id
                            });
                        });
                    } else {

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

                        var lecturerSocketSession = activeLecture.lecturerSocketSession;
                        if (lecturerSocketSession) {
                            lecturerSocketSession.emit('on_listener_went', {
                                userId: userId
                            });
                        }
                    }
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

                _.forEach(observers, _.bind(function (observer) {
                    observer.emit('on_lecture_started', {
                        lectureId: this.id,
                        name: this.name,
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
            getTotalDuration: function () {

                var timeline = this.statisticChart['timeline'];
                var startTime = timeline[0].startTime;
                var finishTime = timeline[timeline.length - 1].finishTime;
                if (finishTime == 'expected') {
                    finishTime = _.now();
                }

                return Math.floor((finishTime - startTime) / 1000);
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
            addAskedQuestion: function (questionId) {
                var askedQuestions = this.askedQuestions;
                askedQuestions.push(new AskedQuestion(questionId));
            },
            addListenerAnswer: function (userId, questionId, answerData) {

                var askedQuestion = _.findWhere(this.askedQuestions, {
                    questionId: questionId
                });

                if (askedQuestion) {
                    askedQuestion.addListenerAnswer(userId, answerData);
                    return true;
                }

                return false;
            },
            toPublic: function (userId) {
                return {
                    id: this.id,
                    name: this.name,
                    lecturer: this.lecturer,
                    duration: this.getDuration(),
                    status: this.status,
                    listeners: (_.bind(function () {
                        var listeners = [];
                        _.forEach(this.listeners, function (listener) {
                            if (userId != listener.userId) {
                                listeners.push(listener.userId);
                            }
                        });
                        return listeners;
                    }, this))()
                };
            },
            toPrivate: function () {
                return {
                    id: this.id,
                    name: this.name,
                    duration: this.getDuration(),
                    status: this.status,
                    listeners: (_.bind(function () {
                        var listeners = [];
                        _.forEach(this.listeners, function (listener) {
                            listeners.push(listener.userId);
                        });
                        return listeners;
                    }, this))(),
                    askedQuestions: this.askedQuestions,
                    statisticChart: this.statisticChart
                };
            }
        };

        return ActiveLecture;
    })();

    var activeLectures = [];
    var observers = [];
    var socketManager = {
        io: null,
        removeNamespace: function (name) {
            delete (this.io || {nsps: {}}).nsps[name];
        }
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

            var query = socket.handshake['query'];
            var userId = query.userId;
            var url = query.url;

            if (url != '/') {
                return;
            }

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

                        var activeLecture = new ActiveLecture(lecture);

                        activeLectures.push(activeLecture);

                        activeLecture.start();

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

            var activeLecture = _.find(activeLectures, function (activeLecture) {
                return activeLecture.id == lectureId;
            });

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

            var activeLecture = _.find(activeLectures, function (activeLecture) {
                return activeLecture.id == lectureId;
            });

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

            var activeLecture = _.find(activeLectures, function (activeLecture) {
                return activeLecture.id == lectureId;
            });

            if (activeLecture) {

                activeLecture.stop();

                StatisticChartRepository.createStatisticChart(activeLecture.id, (function () {
                    var statisticChart = activeLecture.statisticChart;
                    return statisticChart.toJSON();
                })()).then(function () {

                    activeLectures = _.without(activeLectures, activeLecture);

                    resolve('success');
                }, function () {
                    resolve('cant_update_statistic');
                });
            } else {
                resolve('not_found');
            }
        });
    }

    function getLecturerActiveLectures(userId) {

        return Promise(function (resolve) {

            try {

                var lecturerActiveLectures = ArrayUtils.select((function () {
                    return _.filter(activeLectures, function (activeLecture) {
                        return activeLecture.lecturer['id'] == userId;
                    });
                })(), function (ownActiveLecture) {
                    return ownActiveLecture.toPrivate();
                });

                resolve(lecturerActiveLectures);
            } catch (e) {
                resolve();
            }
        });
    }

    function getLecturerActiveLecture(lectureId, userId) {
        return Promise(function (resolve) {

            try {
                var lecturerActiveLecture = _.find(activeLectures, function (activeLecture) {
                    return activeLecture.id == lectureId;
                }).toPrivate();

                resolve(lecturerActiveLecture);
            } catch (e) {
                resolve();
            }
        });
    }

    function getListenerActiveLectures(userId) {

        return Promise(function (resolve) {

            try {
                var listenerActiveLectures = ArrayUtils.select(activeLectures, function (ownActiveLecture) {
                    return ownActiveLecture.toPublic(userId);
                });

                resolve(listenerActiveLectures);
            } catch (e) {
                resolve();
            }
        });
    }

    function getListenerActiveLecture(lectureId, userId) {
        return Promise(function (resolve) {

            try {
                var listenerActiveLecture = _.find(activeLectures, function (activeLecture) {
                    return activeLecture.id == lectureId;
                }).toPublic(userId);

                resolve(listenerActiveLecture);
            } catch (e) {
                resolve();
            }
        });
    }

    module.exports = {
        use: use,
        startLecture: startLecture,
        suspendLecture: suspendLecture,
        resumeLecture: resumeLecture,
        stopLecture: stopLecture,
        getLecturerActiveLectures: getLecturerActiveLectures,
        getLecturerActiveLecture: getLecturerActiveLecture,
        getListenerActiveLectures: getListenerActiveLectures,
        getListenerActiveLecture: getListenerActiveLecture
    };

})(require);