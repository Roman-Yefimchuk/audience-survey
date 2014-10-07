"use strict";

(function (require) {

    module.exports = function (developmentMode) {

        var _ = require('underscore');
        var asyncEach = require('../utils/async-each');

        var ObjectID = require('mongodb')['ObjectID'];

        var ChartPointModel = require('./models/chart-point');
        var TimeMarkerModel = require('./models/time-marker');
        var LectureModel = require('./models/lecture');
        var QuestionModel = require('./models/question');
        var StatisticChartModel = require('./models/statistic-chart');
        var UserModel = require('./models/user');

        function extractPropertyId(property) {
            return property['_id'].toString();
        }

        function createUser(data, callback) {

            var user = new UserModel({
                name: data.name,
                password: data.password,
                role: data.role
            });

            user.save(function (error, user) {

                if (error) {
                    throw error;
                }

                callback({
                    userId: extractPropertyId(user),
                    name: user.name,
                    password: user.password,
                    role: user.role
                });
            });
        }

        function findUser(name, callback) {

            UserModel.findOne({
                name: name
            }, function (error, user) {

                if (error) {
                    throw error;
                }

                if (user) {
                    callback({
                        userId: extractPropertyId(user),
                        name: user.name,
                        password: user.password,
                        role: user.role
                    });
                } else {
                    callback();
                }
            });
        }

        function createLecture(data, callback) {

            var lecture = new LectureModel({
                name: data.name,
                authorId: data.authorId
            });

            lecture.save(function (error, lecture) {

                if (error) {
                    throw error;
                }

                var lectureId = extractPropertyId(lecture);
                callback(lectureId);
            });
        }

        function updateLecture(lectureId, data, callback) {

            LectureModel.findById(lectureId, function (error, lecture) {

                if (error) {
                    throw error;
                }

                if (lecture) {
                    lecture.name = data.name;

                    lecture.save(function (error, lecture) {

                        if (error) {
                            throw error;
                        }

                        callback();
                    });
                } else {
                    throw 'Lecture not found';
                }
            });
        }

        function removeLecture(lectureId, callback) {

            LectureModel.findById(lectureId, function (error, lecture) {

                if (error) {
                    throw error;
                }

                if (lecture) {
                    lecture.remove(function (error) {

                        if (error) {
                            throw error;
                        }

                        callback();
                    });
                } else {
                    throw 'Lecture not found';
                }
            });
        }

        function getLecturesByAuthorId(authorId, callback) {

            LectureModel.find({
                authorId: authorId
            }, function (error, lectures) {

                if (error) {
                    throw error;
                }

                var result = [];

                asyncEach(lectures, function (lecture, index, next) {

                    var authorId = lecture.authorId;

                    UserModel.findById(authorId, function (error, user) {

                        if (error) {
                            throw error;
                        }

                        if (user) {

                            result.push({
                                id: extractPropertyId(lecture),
                                name: lecture.name,
                                author: user.name,
                                statisticCharts: lecture.statisticCharts,
                                status: lecture.status
                            });

                            next();
                        } else {
                            throw 'Author not found';
                        }
                    });
                }, function () {
                    callback(result);
                });
            });
        }

        function getLectureById(lectureId, callback) {

            LectureModel.findById(lectureId, function (error, lecture) {

                if (error) {
                    throw error;
                }

                if (lecture) {

                    var authorId = lecture.authorId;

                    try {
                        getUserById(authorId, function (user) {
                            callback({
                                id: extractPropertyId(lecture),
                                name: lecture.name,
                                author: {
                                    id: user.id,
                                    name: user.name
                                },
                                status: lecture.status
                            });
                        });
                    } catch (e) {
                        throw 'Author not found';
                    }
                } else {
                    throw 'Lecture not found';
                }
            });
        }

        function loadStatisticForLecture(lectureId, callback) {
        }

        function saveStatisticForLecture(lectureId, data, callback) {

            var date = data.date;
            var chartPoints = data.chartPoints;
            var timeline = data.timeline;
            var totalDuration = data.totalDuration;

            function getChartPoints() {
                var result = [];

                _.forEach(chartPoints, function (chartPoint) {
                    result.push(new ChartPointModel(chartPoint));
                });

                return result;
            }

            function getTimeline() {
                var result = [];

                _.forEach(timeline, function (timeMarker) {
                    result.push(new TimeMarkerModel(timeMarker));
                });

                return result;
            }

            var statisticChart = new StatisticChartModel({
                date: date,
                chartPoints: getChartPoints(),
                timeline: getTimeline(),
                totalDuration: totalDuration
            });

            statisticChart.save(function (error, model) {
                callback();
            });
        }

        function getActiveLectures(callback) {

            var result = [];

            LectureModel.find({
                status: {
                    $ne: 'stopped'
                }
            }, function (error, activeLecturesCollection) {

                if (error) {
                    throw error;
                }

                asyncEach(activeLecturesCollection, function (activeLecture, index, next) {

                    var authorId = activeLecture.authorId;

                    UserModel.findById(authorId, function (error, user) {

                        if (error) {
                            throw error;
                        }

                        if (user) {
                            result.push({
                                id: extractPropertyId(activeLecture),
                                name: activeLecture.name,
                                author: user.name,
                                status: activeLecture.status
                            });

                            next();
                        } else {
                            throw 'Author not found';
                        }
                    });
                }, function () {
                    callback(result);
                });
            });
        }

        function updateLectureStatus(lectureId, status, callback) {

            LectureModel.findById(lectureId, function (error, lecture) {

                if (error) {
                    throw error;
                }

                if (lecture) {
                    if (lecture.status != status) {
                        lecture.status = status;
                        lecture.save(function (error, lecture) {
                            callback();
                        });
                    } else {
                        callback();
                    }
                } else {
                    throw 'Lecture not found';
                }
            });
        }

        function createQuestion(title, lectureId, callback) {
            var question = new QuestionModel({
                title: title,
                lectureId: lectureId
            });

            question.save(function (error, model) {
                if (error) {
                    throw error;
                }

                var questionId = extractPropertyId(model);
                callback(questionId);
            });
        }

        function updateQuestion(questionId, title, callback) {
            QuestionModel.findById(questionId, function (error, model) {

                if (error) {
                    throw error;
                }

                if (model) {

                    model.title = title;
                    model.save(function (error) {

                        if (error) {
                            throw error;
                        }

                        callback();
                    });
                } else {
                    throw 'Question not found';
                }
            });
        }

        function removeQuestion(questionId, callback) {
            QuestionModel.findById(questionId, function (error, model) {

                if (error) {
                    throw  error;
                }

                if (model) {
                    model.remove(function (error) {

                        if (error) {
                            throw error;
                        }

                        callback();
                    });
                } else {
                    throw 'Question not found';
                }
            });
        }

        function getQuestionsByLectureId(lectureId, callback) {
            QuestionModel.find({
                lectureId: lectureId
            }, function (error, questions) {

                if (error) {
                    throw error;
                }

                var result = [];

                _.forEach(questions, function (question) {
                    result.push({
                        id: extractPropertyId(question),
                        title: question.title,
                        lectureId: question.lectureId,
                        creationDate: question.creationDate
                    });
                });

                callback(result);
            });
        }

        function getQuestionById(questionId, callback) {
            QuestionModel.findById(questionId, function (error, model) {

                if (error) {
                    throw error;
                }

                if (model) {
                    callback({
                        id: questionId,
                        title: model.title,
                        lectureId: model.lectureId,
                        creationDate: model.creationDate
                    });
                } else {
                    throw 'Question not found';
                }
            });
        }

        function getUserById(userId, callback) {
            UserModel.findById(userId, function (error, model) {

                if (error) {
                    throw error;
                }

                if (model) {
                    callback({
                        id: userId,
                        name: model.name,
                        role: model.role
                    });
                } else {
                    throw 'User not found';
                }
            });
        }

        function getUsersById(ids, callback) {
            var result = [];

            asyncEach(ids, function (userId, index, next) {

                getUserById(userId, function (user) {
                    result.push(user);
                    next();
                });
            }, function () {
                callback(result);
            });
        }

        return {
            createUser: createUser,
            findUser: findUser,

            createLecture: createLecture,
            updateLecture: updateLecture,
            removeLecture: removeLecture,
            getLecturesByAuthorId: getLecturesByAuthorId,
            getLectureById: getLectureById,
            loadStatisticForLecture: loadStatisticForLecture,
            saveStatisticForLecture: saveStatisticForLecture,
            getActiveLectures: getActiveLectures,
            updateLectureStatus: updateLectureStatus,

            createQuestion: createQuestion,
            updateQuestion: updateQuestion,
            removeQuestion: removeQuestion,
            getQuestionsByLectureId: getQuestionsByLectureId,
            getQuestionById: getQuestionById,

            getUserById: getUserById,
            getUsersById: getUsersById
        };
    };

})(require);