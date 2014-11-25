"use strict";

(function (require) {

    module.exports = function (db) {

        var RECORD_ID_PATTERN = /^\#\-?\d+\:\d+$/;
        var SYSTEM_ID_PATTERN = /^\@.+/;

        var _ = require('underscore');

        var asyncEach = require('../utils/async-each');
        var security = require('../utils/security');

        var encodeBase64 = security.encodeBase64;
        var decodeBase64 = security.decodeBase64;
        var forEach = _.forEach;

        function extractPropertyId(property) {
            if (property) {
                return (property['rid'] || property['@rid']).toString();
            }
        }

        function createLecture(data, callback) {

            var successCallback = callback.success;
            var failureCallback = callback.failure;

            getUserById(data.authorId, {
                success: function (user) {
                    db.query("" +
                        "INSERT INTO Lecture (name, authorId, author, status)" +
                        "VALUES (:name, :authorId, :author, 'stopped') ", {
                        params: {
                            name: data.name,
                            authorId: data.authorId,
                            author: user.displayName
                        }
                    }).then(function (results) {
                        if (results.length > 0) {
                            var lectureId = extractPropertyId(results[0]);
                            successCallback(lectureId);
                        } else {
                            successCallback();
                        }
                    }).catch(function (error) {
                        failureCallback(error);
                    });
                },
                failure: failureCallback
            });
        }

        function updateLecture(lectureId, data, callback) {
            db.query("" +
                "UPDATE Lecture " +
                "SET name = :name, author = :author, description = :description, additionalLinks = :additionalLinks " +
                "WHERE @rid = :lectureId", {
                params: {
                    name: data.name,
                    author: data.author,
                    description: data.description,
                    additionalLinks: data.additionalLinks,
                    lectureId: lectureId
                }
            }).then(function (results) {
                callback.success();
            }).catch(function (error) {
                callback.failure(error);
            });
        }

        function removeLecture(lectureId, callback) {
            db.query("" +
                "DELETE FROM Lecture " +
                "WHERE @rid = :lectureId", {
                params: {
                    lectureId: lectureId
                }
            }).then(function (total) {
                callback.success();
            }).catch(function (error) {
                callback.failure(error);
            });
        }

        function loadStatisticForLecture(lectureId, callback) {

            var successCallback = callback.success;
            var failureCallback = callback.failure;

            successCallback([]);

            /*            LectureModel.findById(lectureId, function (error, model) {

             if (error) {
             throw error;
             }

             if (model) {
             var statisticCharts = model.statisticCharts;
             callback(statisticCharts);
             } else {
             throw 'Lecture not found';
             }
             });*/
        }

        function saveStatisticForLecture(lectureId, data, callback) {

            var successCallback = callback.success;
            var failureCallback = callback.failure;

            successCallback();
            /*
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

             LectureModel.findById(lectureId, function (error, model) {

             if (error) {
             throw error;
             }

             if (model) {
             var statisticChartModel = new StatisticChartModel({
             date: date,
             chartPoints: getChartPoints(),
             timeline: getTimeline(),
             totalDuration: totalDuration
             });

             var statisticCharts = model.statisticCharts;
             statisticCharts.push(statisticChartModel);

             model.save(function (error, model) {
             callback();
             });
             } else {
             throw 'Lecture not found';
             }
             });*/
        }

        function wrapLecture(lecture, author) {
            return {
                id: extractPropertyId(lecture),
                name: lecture.name,
                authorId: lecture.authorId,
                author: author,
                description: lecture.description,
                statisticCharts: lecture.statisticCharts,
                status: lecture.status,
                additionalLinks: lecture.additionalLinks
            };
        }

        function getLecturesByAuthorId(authorId, callback) {
            db.query("" +
                "SELECT * " +
                "FROM Lecture " +
                "WHERE authorId = :authorId", {
                params: {
                    authorId: authorId
                }
            }).then(function (results) {

                var result = [];

                asyncEach(results, function (activeLecture, index, next) {
                    getUserById(authorId, {
                        success: function (user) {
                            result.push(wrapLecture(activeLecture, user.displayName));
                            next();
                        },
                        failure: function (error) {
                            result.push(wrapLecture(activeLecture, 'UNKNOWN USER'));
                            next();
                        }
                    });
                }, function () {
                    callback.success(result);
                });
            }).catch(function (error) {
                callback.failure(error);
            });
        }

        function getLectureById(lectureId, callback) {

            var successCallback = callback.success;

            db.query("" +
                "SELECT * " +
                "FROM Lecture " +
                "WHERE @rid = :lectureId", {
                params: {
                    lectureId: lectureId
                }
            }).then(function (results) {
                var lecture = results[0];
                var authorId = lecture.authorId;

                getUserById(authorId, {
                    success: function (user) {
                        successCallback(wrapLecture(lecture, user.displayName));
                    },
                    failure: function (error) {
                        successCallback(wrapLecture(lecture, 'UNKNOWN USER'));
                    }
                });
            }).catch(function (error) {
                callback.failure(error);
            });
        }

        function getActiveLectures(callback) {
            db.query("" +
                "SELECT * " +
                "FROM Lecture " +
                "WHERE status <> 'stopped'", {
            }).then(function (results) {

                var result = [];

                asyncEach(results, function (activeLecture, index, next) {

                    var authorId = activeLecture.authorId;

                    getUserById(authorId, {
                        success: function (user) {
                            result.push(wrapLecture(activeLecture, user.displayName));
                            next();
                        },
                        failure: function (error) {
                            result.push(wrapLecture(activeLecture, 'UNKNOWN USER'));
                            next();
                        }
                    });
                }, function () {
                    callback.success(result);
                });
            }).catch(function (error) {
                callback.failure(error);
            });
        }

        function updateLectureStatus(lectureId, status, callback) {

            var failureCallback = callback.failure;

            db.query("" +
                "SELECT COUNT(*) AS count " +
                "FROM Lecture " +
                "WHERE @rid = :lectureId", {
                params: {
                    lectureId: lectureId
                }
            }).then(function (results) {
                if (results[0].count > 0) {

                    db.query("" +
                        "UPDATE Lecture " +
                        "SET status = :status " +
                        "WHERE @rid = :lectureId", {
                        params: {
                            lectureId: lectureId,
                            status: status
                        }
                    }).then(function (total) {
                        callback.success();
                    }).catch(function (error) {
                        failureCallback(error);
                    });

                } else {
                    failureCallback('Lecture not found');
                }
            }).catch(function (error) {
                failureCallback(error);
            });
        }

        function createQuestion(lectureId, questionModel, callback) {
            db.query("" +
                "INSERT INTO Question (title, lectureId, creationDate, type, data) " +
                "VALUES (:title, :lectureId, :creationDate, :type, :data)", {
                params: {
                    title: questionModel.title,
                    lectureId: lectureId,
                    creationDate: _.now(),
                    type: questionModel.type,
                    data: JSON.stringify(questionModel.data)
                }
            }).then(function (results) {
                var questionId = extractPropertyId(results[0]);
                callback.success(questionId);
            }).catch(function (error) {
                callback.failure(error);
            });
        }

        function updateQuestion(questionId, questionModel, callback) {
            db.query("" +
                "UPDATE Question " +
                "SET title = :title, type = :type, data = :data " +
                "WHERE @rid = :questionId", {
                params: {
                    title: questionModel.title,
                    type: questionModel.type,
                    data: JSON.stringify(questionModel.data),
                    questionId: questionId
                }
            }).then(function (total) {
                callback.success();
            }).catch(function (error) {
                callback.failure(error);
            });
        }

        function removeQuestion(questionId, callback) {
            db.query("" +
                "DELETE FROM Question " +
                "WHERE @rid = :questionId", {
                params: {
                    questionId: questionId
                }
            }).then(function (total) {
                callback.success();
            }).catch(function (error) {
                callback.failure(error);
            });
        }

        function getQuestionsByLectureId(lectureId, callback) {
            db.query("" +
                "SELECT * " +
                "FROM Question " +
                "WHERE lectureId = :lectureId", {
                params: {
                    lectureId: lectureId
                }
            }).then(function (results) {

                var result = [];

                if (results.length > 0) {
                    _.forEach(results, function (question) {
                        result.push({
                            id: extractPropertyId(question),
                            title: question.title,
                            lectureId: question.lectureId,
                            creationDate: question.creationDate,
                            type: question.type,
                            data: JSON.parse(question.data)
                        });
                    });
                }

                callback.success(result);
            }).catch(function (error) {
                callback.failure(error);
            });
        }

        function getQuestionById(questionId, callback) {

            var failureCallback = callback.failure;

            db.query("" +
                "SELECT * " +
                "FROM Question " +
                "WHERE @rid = :questionId", {
                params: {
                    questionId: questionId
                }
            }).then(function (results) {
                if (results.length > 0) {
                    var model = results[0];

                    callback.success({
                        id: questionId,
                        title: model.title,
                        lectureId: model.lectureId,
                        creationDate: model.creationDate,
                        type: model.type,
                        data: JSON.parse(model.data)
                    });
                } else {
                    failureCallback('Question not found');
                }
            }).catch(function (error) {
                failureCallback(error);
            });
        }

        function getUserById(userId, callback) {

            var failureCallback = callback.failure;

            db.query("" +
                "SELECT displayName, role " +
                "FROM User " +
                "WHERE @rid = :userId", {
                params: {
                    userId: userId
                }
            }).then(function (results) {
                if (results.length > 0) {
                    var user = results[0];

                    callback.success({
                        id: extractPropertyId(user),
                        name: user.displayName,
                        role: user.role
                    });
                } else {
                    failureCallback('User not found');
                }
            }).catch(function (error) {
                failureCallback(error);
            });
        }

        function getUsersById(ids, callback) {
            var result = [];

            asyncEach(ids, function (userId, index, next) {

                getUserById(userId, {
                    success: function (user) {
                        result.push(user);
                        next();
                    },
                    failure: function (error) {
                        next();
                    }
                });
            }, function () {
                callback.success(result);
            });
        }


        function isSystemId(id) {
            if (id) {
                return SYSTEM_ID_PATTERN.test(id);
            }
            return false;
        }

        function decodeId(id) {
            if (isSystemId(id)) {
                return id;
            } else {
                if (id) {
                    return decodeBase64(id);
                }
            }
        }

        function encodeId(id) {
            if (isSystemId(id)) {
                return id;
            } else {
                if (id) {
                    return encodeBase64(id);
                }
            }
        }

        function decodeObject(object, properties) {
            if (object) {
                forEach(properties, function (property) {
                    object[property] = decodeId(object[property]);
                });
            }
        }

        function encodeObject(object, properties) {
            if (object) {
                forEach(properties, function (property) {
                    object[property] = encodeId(object[property]);
                });
            }
        }

        function getAccountEncoder(callback) {
            return {
                success: function (user) {

                    encodeObject(user, [
                        'userId'
                    ]);

                    callback.success(user);
                },
                failure: function (error) {
                    callback.failure(error);
                }
            };
        }


        function formatParams(data, options) {
            var result = '';
            var mode = options && options.mode;
            var excludedKeys = options && options.excludedKeys;

            forEach(data, function (value, key) {
                if (!_.contains(excludedKeys, key)) {
                    if (result.length > 0) {
                        result += ', ';
                    }
                    switch (mode) {
                        case 'keys':
                        {
                            result += key;
                            break;
                        }
                        case 'values':
                        {
                            result += ':' + key;
                            break;
                        }
                        default :
                        {
                            result += key + ' = :' + key;
                            break;
                        }
                    }
                }
            });

            return result;
        }

        function wrapUser(user) {
            if (user) {
                return {
                    userId: extractPropertyId(user),
                    role: user.role,
                    genericId: user.genericId,
                    displayName: user.displayName,
                    password: user.password,
                    email: user.email,
                    token: user.token,
                    authorizationProvider: user.authorizationProvider,
                    registeredDate: user.registeredDate,
                    isAuthenticated: function () {
                        return !!user.token;
                    },
                    update: function (accountData, callback) {

                        var successCallback = callback.success;
                        var failureCallback = callback.failure;

                        forEach([
                            'genericId',
                            'displayName',
                            'password',
                            'email',
                            'token',
                            'authorizationProvider'
                        ], function (key) {
                            if (key in accountData) {
                                user[key] = accountData[key];
                            }
                        });

                        db.query("" +
                            "UPDATE User " +
                            "SET " + formatParams(accountData) + " " +
                            "WHERE @rid = " + extractPropertyId(user), {
                            params: accountData
                        }).then(function (results) {
                            successCallback(wrapUser(user));
                        }).catch(function (error) {
                            failureCallback(error);
                        });
                    }
                };
            }
        }

        function createUser(data, callback) {

            var failureCallback = callback.failure;

            try {
                forEach([
                    'genericId',
                    'displayName',
                    'password',
                    'token',
                    'authorizationProvider',
                    'registeredDate'
                ], function (key) {
                    if (!(key in data)) {
                        throw "Missing property '" + key + "'";
                    }
                });
            } catch (e) {
                failureCallback(e);
            }

            db.query("" +
                "INSERT INTO User (role, genericId, displayName, password, email, token, authorizationProvider, registeredDate) " +
                "VALUES (:role, :genericId, :displayName, :password, :email, :token, :authorizationProvider, :registeredDate)", {
                params: {
                    role: data.role || 'user',
                    genericId: data.genericId,
                    displayName: data.displayName,
                    password: data.password,
                    email: data.email || '',
                    token: data.token,
                    authorizationProvider: data.authorizationProvider,
                    registeredDate: data.registeredDate
                }
            }).then(function (results) {
                var user = wrapUser(results[0]);
                callback.success(user);
            }).catch(function (error) {
                failureCallback(error);
            });
        }

        function findUser(genericId, callback) {

            var successCallback = callback.success;

            db.query("" +
                "SELECT * " +
                "FROM User " +
                "WHERE genericId = :genericId", {
                params: {
                    genericId: genericId
                }
            }).then(function (results) {
                if (results.length > 0) {
                    var user = wrapUser(results[0]);
                    successCallback(user);
                } else {
                    successCallback();
                }
            }).catch(function (error) {
                callback.failure(error);
            });
        }

        return {
            createUser: function (data, callback) {
                createUser(data, getAccountEncoder(callback));
            },
            findUser: function (genericId, callback) {
                findUser(genericId, getAccountEncoder(callback));
            },
            createLecture: function (data, callback) {

                decodeObject(data, [
                    'authorId'
                ]);

                createLecture(data, {
                    success: function (lectureId) {
                        lectureId = encodeId(lectureId);
                        callback.success(lectureId);
                    },
                    failure: callback.failure
                });
            },
            updateLecture: function (lectureId, data, callback) {
                lectureId = decodeId(lectureId);
                updateLecture(lectureId, data, callback);
            },
            removeLecture: function (lectureId, callback) {
                lectureId = decodeId(lectureId);
                removeLecture(lectureId, callback);
            },
            loadStatisticForLecture: loadStatisticForLecture,
            saveStatisticForLecture: saveStatisticForLecture,
            getLecturesByAuthorId: function (authorId, callback) {
                authorId = decodeId(authorId);
                getLecturesByAuthorId(authorId, {
                    success: function (lectures) {

                        forEach(lectures, function (lecture) {
                            encodeObject(lecture, [
                                'id',
                                'authorId'
                            ]);
                        });

                        callback.success(lectures);
                    },
                    failure: callback.failure
                })
            },
            getLectureById: function (lectureId, callback) {
                lectureId = decodeId(lectureId);
                getLectureById(lectureId, {
                    success: function (lecture) {

                        encodeObject(lecture, [
                            'id',
                            'authorId'
                        ]);

                        callback.success(lecture);
                    },
                    failure: callback.failure
                });
            },
            getActiveLectures: function (callback) {
                getActiveLectures({
                    success: function (lectures) {

                        forEach(lectures, function (lecture) {
                            encodeObject(lecture, [
                                'id',
                                'authorId'
                            ]);
                        });

                        callback.success(lectures);
                    },
                    failure: callback.failure
                });
            },
            updateLectureStatus: function (lectureId, status, callback) {
                lectureId = decodeId(lectureId);
                updateLectureStatus(lectureId, status, callback);
            },
            createQuestion: function (lectureId, questionModel, callback) {
                lectureId = decodeId(lectureId);
                createQuestion(lectureId, questionModel, {
                    success: function (questionId) {
                        questionId = encodeId(questionId);
                        callback.success(questionId);
                    },
                    failure: callback.failure
                });
            },
            updateQuestion: function (questionId, questionModel, callback) {
                questionId = decodeId(questionId);
                updateQuestion(questionId, questionModel, callback);
            },
            removeQuestion: function (questionId, callback) {
                questionId = decodeId(questionId);
                removeQuestion(questionId, callback);
            },
            getQuestionsByLectureId: function (lectureId, callback) {

                lectureId = decodeId(lectureId);

                getQuestionsByLectureId(lectureId, {
                    success: function (questions) {
                        forEach(questions, function (question) {
                            encodeObject(question, [
                                'id',
                                'lectureId'
                            ]);
                        });

                        callback.success(questions);
                    },
                    failure: callback.failure
                });
            },
            getQuestionById: function (questionId, callback) {

                questionId = decodeId(questionId);

                getQuestionById(questionId, {
                    success: function (question) {

                        encodeObject(question, [
                            'id',
                            'lectureId'
                        ]);

                        callback.success(question);
                    },
                    failure: callback.failure
                });
            },
            getUserById: function (userId, callback) {
                userId = decodeId(userId);

                getUserById(userId, {
                    success: function (user) {
                        callback.success({
                            id: encodeId(user.id),
                            name: user.displayName,
                            role: user.role
                        });
                    },
                    failure: callback.failure
                });
            },
            getUsersById: function (ids, callback) {

                forEach(ids, function (id, index) {
                    ids[index] = decodeId(id);
                });

                getUsersById(ids, {
                    success: function (users) {
                        forEach(users, function (user) {
                            encodeObject(user, [
                                'id'
                            ]);
                        });
                        callback.success(users);
                    },
                    failure: callback.failure
                });
            }
        };
    };

})(require);