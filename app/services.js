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

        dbProvider.createLecture(data, function (lectureId) {
            resultCallback({
                data: {
                    lectureId: lectureId
                }
            });
        });
    });

    serviceProvider.post('/api/lectures/:lectureId/update', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var lectureId = request.params['lectureId'];
        var lectureData = request.body;

        dbProvider.updateLecture(lectureId, lectureData, function () {
            resultCallback();
        });
    });

    serviceProvider.get('/api/lectures/:lectureId/remove', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var lectureId = request.params['lectureId'];

        dbProvider.removeLecture(lectureId, function () {
            resultCallback();
        });
    });

    serviceProvider.get('/api/lectures/get-by-author-id/:authorId', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var authorId = request.params['authorId'];

        dbProvider.getLecturesByAuthorId(authorId, function (lectures) {
            resultCallback({
                data: {
                    lectures: lectures
                }
            });
        });
    });

    serviceProvider.get('/api/lectures/get-by-id/:lectureId', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var lectureId = request.params['lectureId'];

        dbProvider.getLectureById(lectureId, function (lecture) {
            resultCallback({
                data: {
                    lecture: lecture
                }
            });
        });
    });

    serviceProvider.get('/api/lectures/:lectureId/statistic', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var lectureId = request.params['lectureId'];

        dbProvider.getStatisticForLecture(lectureId, function (statistic) {
            resultCallback({
                data: {
                    statistic: statistic
                }
            });
        });
    });

    serviceProvider.post('/api/lectures/:lectureId/statistic/update', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var lectureId = request.params['lectureId'];
        var data = request.body;

        dbProvider.updateStatisticForLecture(lectureId, data, function () {
            resultCallback();
        });
    });

    serviceProvider.get('/api/lectures/active', function (request, response, resultCallback) {

        checkAuthenticated(request);

        dbProvider.getActiveLectures(function (activeLectures) {
            resultCallback({
                data: {
                    activeLectures: activeLectures
                }
            });
        });
    });

    serviceProvider.post('/api/lectures/:lectureId/update-status', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var lectureId = request.params['lectureId'];
        var status = request.body['status'];

        dbProvider.updateLectureStatus(lectureId, status, function () {
            resultCallback();
        });
    });

    serviceProvider.post('/api/questions/create', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var title = request.body['title'];
        var lectureId = request.body['lectureId'];

        dbProvider.createQuestion(title, lectureId, function (questionId) {
            resultCallback({
                data: {
                    questionId: questionId
                }
            });
        });
    });

    serviceProvider.post('/api/questions/:questionId/update', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var questionId = request.params['questionId'];
        var title = request.body['title'];

        dbProvider.updateQuestion(questionId, title, function () {
            resultCallback();
        });
    });

    serviceProvider.get('/api/questions/:questionId/remove', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var questionId = request.params['questionId'];

        dbProvider.removeQuestion(questionId, function () {
            resultCallback();
        });
    });

    serviceProvider.get('/api/questions/get-by-lecture-id/:lectureId', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var lectureId = request.params['lectureId'];

        dbProvider.getQuestionsByLectureId(lectureId, function (questions) {
            resultCallback({
                data: {
                    questions: questions
                }
            });
        });
    });

    serviceProvider.get('/api/questions/get-by-id/:questionId', function (request, response, resultCallback) {

        checkAuthenticated(request);

        var questionId = request.params['questionId'];

        dbProvider.getQuestionById(questionId, function (question) {
            resultCallback({
                data: {
                    question: question
                }
            });
        });
    });
};