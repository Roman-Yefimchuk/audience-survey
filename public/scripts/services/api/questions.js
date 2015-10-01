"use strict";

angular.module('application')

    .service('questionsService', [

        '$q',
        'httpClientService',

        function ($q, httpClientService) {

            function getQuestions(userId, lectureId) {
                return httpClientService.get('users/' + userId + '/lectures/' + lectureId + '/questions');
            }

            function createQuestion(userId, lectureId, data) {
                return httpClientService.post('users/' + userId + '/lectures/' + lectureId + '/questions/create', data);
            }

            function getQuestion(userId, lectureId, questionId) {
                return httpClientService.get('users/' + userId + '/lectures/' + lectureId + '/questions/' + questionId);
            }

            function updateQuestion(userId, lectureId, questionId, data) {
                return httpClientService.post('users/' + userId + '/lectures/' + lectureId + '/questions/' + questionId + '/update', data);
            }

            function removeQuestion(userId, lectureId, questionId) {
                return httpClientService.get('users/' + userId + '/lectures/' + lectureId + '/questions/' + questionId + '/remove');
            }

            return {
                getQuestions: getQuestions,
                createQuestion: createQuestion,
                getQuestion: getQuestion,
                updateQuestion: updateQuestion,
                removeQuestion: removeQuestion
            };
        }
    ]
);