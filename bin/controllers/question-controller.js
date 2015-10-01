"use strict";

(function (require) {

    var Q = require('q');
    var Promise = Q['promise'];

    var QuestionRepository = require('./../db/data-access-layers/question-repository');
    var ControllerUtils = require('./../utils/controller-utils');
    var RequestFilter = require('./../request-filter');

    function model() {
        return new ControllerUtils.RequestResolver('body');
    }

    module.exports = function (controller) {
        return controller({
            routePrefix: 'users/:userId/lectures/:lectureId/questions',
            actions: [
                {
                    route: '',
                    method: 'get',
                    params: ['lectureId'],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId'),
                        RequestFilter.checkRole(['lecturer'])
                    ],
                    handler: function (lectureId) {

                        return Promise(function (resolve, reject) {

                            QuestionRepository.getQuestions(lectureId)
                                .then(function (questions) {
                                    resolve(questions)
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: 'create',
                    method: 'post',
                    params: ['lectureId', model()],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId'),
                        RequestFilter.checkRole(['lecturer'])
                    ],
                    handler: function (lectureId, model) {

                        return Promise(function (resolve, reject) {

                            QuestionRepository.createQuestion(lectureId, model)
                                .then(function (questionId) {
                                    resolve({
                                        questionId: questionId
                                    })
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: ':questionId',
                    method: 'get',
                    params: ['questionId'],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId'),
                        RequestFilter.checkRole(['lecturer'])
                    ],
                    handler: function (questionId) {

                        return Promise(function (resolve, reject) {

                            QuestionRepository.getQuestion(questionId)
                                .then(function (question) {
                                    resolve(question);
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: ':questionId/update',
                    method: 'post',
                    params: ['questionId', model()],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId'),
                        RequestFilter.checkRole(['lecturer'])
                    ],
                    handler: function (questionId, model) {

                        return Promise(function (resolve, reject) {

                            QuestionRepository.updateQuestion(questionId, model)
                                .then(function () {
                                    resolve()
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: ':questionId/remove',
                    method: 'get',
                    params: [ 'lectureId', 'questionId'],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId'),
                        RequestFilter.checkRole(['lecturer'])
                    ],
                    handler: function (lectureId, questionId) {

                        return Promise(function (resolve, reject) {

                            QuestionRepository.removeQuestion(lectureId, questionId)
                                .then(function () {
                                    resolve()
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                }
            ]
        });
    };

})(require);