"use strict";

module.exports = function (app, dbProvider, serviceProvider) {

    var Exception = require('../app/exception');

    function checkAuthenticated(request) {
        if (!request.user) {
            throw new Exception(Exception.NOT_AUTHENTICATED, 'You are not authenticated');
        }
    }

    serviceProvider.post('/api/lectures/create', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var data = request.body;

        dbProvider.createLecture(data, {
            success: function (lectureId) {
                resultCallback({
                    data: {
                        lectureId: lectureId
                    }
                });
            },
            failure: function (error) {
                throw error;
            }
        });
    });

    serviceProvider.post('/api/lectures/:lectureId/update', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var lectureId = request.params['lectureId'];
        var lectureData = request.body;

        dbProvider.updateLecture(lectureId, lectureData, {
            success: function () {
                resultCallback();
            },
            failure: function (error) {
                throw error;
            }
        });
    });

    serviceProvider.get('/api/lectures/:lectureId/remove', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var lectureId = request.params['lectureId'];

        dbProvider.removeLecture(lectureId, {
            success: function () {
                resultCallback();
            },
            failure: function (error) {
                throw error;
            }
        });
    });

    serviceProvider.get('/api/lectures/get-by-author-id/:authorId', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var authorId = request.params['authorId'];

        dbProvider.getLecturesByAuthorId(authorId, {
            success: function (lectures) {
                resultCallback({
                    data: {
                        lectures: lectures
                    }
                });
            },
            failure: function (error) {
                throw error;
            }
        });
    });

    serviceProvider.get('/api/lectures/get-by-id/:lectureId', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var lectureId = request.params['lectureId'];

        dbProvider.getLectureById(lectureId, {
            success: function (lecture) {
                resultCallback({
                    data: {
                        lecture: lecture
                    }
                });
            },
            failure: function (error) {
                throw error;
            }
        });
    });

    serviceProvider.get('/api/lectures/:lectureId/statistic', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var lectureId = request.params['lectureId'];

        dbProvider.loadStatisticForLecture(lectureId, {
            success: function (data) {
                resultCallback({
                    data: data
                });
            },
            failure: function (error) {
                throw error;
            }
        });
    });

    serviceProvider.post('/api/lectures/:lectureId/statistic/update', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var lectureId = request.params['lectureId'];
        var data = request.body;

        dbProvider.updateStatisticForLecture(lectureId, data, {
            success: function () {
                resultCallback();
            },
            failure: function (error) {
                throw error;
            }
        });
    });

    serviceProvider.get('/api/lectures/active', function (request, response, resultCallback) {

        checkAuthenticated(request);

        dbProvider.getActiveLectures({
            success: function (activeLectures) {
                resultCallback({
                    data: {
                        activeLectures: activeLectures
                    }
                });
            },
            failure: function (error) {
                throw error;
            }
        });
    });

    serviceProvider.post('/api/lectures/:lectureId/update-status', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var lectureId = request.params['lectureId'];
        var status = request.body['status'];

        dbProvider.updateLectureStatus(lectureId, status, {
            success: function () {
                resultCallback();
            },
            failure: function (error) {
                throw error;
            }
        });
    });

    serviceProvider.post('/api/questions/create', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var lectureId = request.body['lectureId'];
        var questionModel = request.body['questionModel'];

        dbProvider.createQuestion(lectureId, questionModel, {
            success: function (questionId) {
                resultCallback({
                    data: {
                        questionId: questionId
                    }
                });
            },
            failure: function (error) {
                throw error;
            }
        });
    });

    serviceProvider.post('/api/questions/:questionId/update', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var questionId = request.params['questionId'];
        var questionModel = request.body['questionModel'];

        dbProvider.updateQuestion(questionId, questionModel, {
            success: function () {
                resultCallback();
            },
            failure: function (error) {
                throw error;
            }
        });
    });

    serviceProvider.get('/api/questions/:questionId/remove', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var questionId = request.params['questionId'];

        dbProvider.removeQuestion(questionId, {
            success: function () {
                resultCallback();
            },
            failure: function (error) {
                throw error;
            }
        });
    });

    serviceProvider.get('/api/questions/get-by-lecture-id/:lectureId', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var lectureId = request.params['lectureId'];

        dbProvider.getQuestionsByLectureId(lectureId, {
            success: function (questions) {
                resultCallback({
                    data: {
                        questions: questions
                    }
                });
            },
            failure: function (error) {
                throw error;
            }
        });
    });

    serviceProvider.get('/api/questions/get-by-id/:questionId', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var questionId = request.params['questionId'];

        dbProvider.getQuestionById(questionId, {
            success: function (question) {
                resultCallback({
                    data: {
                        question: question
                    }
                });
            },
            failure: function (error) {
                throw error;
            }
        });
    });

    serviceProvider.get('/api/users/get-by-id/:userId', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var userId = request.params['userId'];

        dbProvider.getUserById(userId, {
            success: function (user) {
                resultCallback({
                    data: {
                        user: user
                    }
                });
            },
            failure: function (error) {
                throw error;
            }
        });
    });

    serviceProvider.post('/api/users/get-by-id', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var ids = request.body['ids'];

        dbProvider.getUsersById(ids, {
            success: function (users) {
                resultCallback({
                    data: {
                        users: users
                    }
                });
            },
            failure: function (error) {
                throw error;
            }
        });
    });
};