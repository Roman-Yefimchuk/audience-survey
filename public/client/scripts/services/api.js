"use strict";

angular.module('application')

    .service('apiService', [

        'httpClientService',

        function (httpClientService) {

            return {
                feedback: function (feedbackModel, handler) {
                    httpClientService.sendRequest({
                        method: 'POST',
                        data: {
                            feedbackModel: feedbackModel
                        },
                        url: '/api/feedback'
                    }, handler);
                },
                login: function (data, handler) {
                    httpClientService.sendRequest({
                        method: 'POST',
                        data: data,
                        url: '/api/authenticate/login'
                    }, handler);
                },
                signUp: function (data, handler) {
                    httpClientService.sendRequest({
                        method: 'POST',
                        data: data,
                        url: '/api/authenticate/sign-up'
                    }, handler);
                },
                createLecture: function (data, handler) {
                    httpClientService.sendRequest({
                        method: 'POST',
                        data: data,
                        url: '/api/lectures/create'
                    }, handler);
                },
                updateLecture: function (lectureId, data, handler) {
                    httpClientService.sendRequest({
                        method: 'POST',
                        data: data,
                        url: '/api/lectures/' + lectureId + '/update'
                    }, handler);
                },
                removeLecture: function (lectureId, handler) {
                    httpClientService.sendRequest({
                        method: 'GET',
                        url: '/api/lectures/' + lectureId + '/remove'
                    }, handler);
                },
                getLecturesByAuthorId: function (authorId, handler) {
                    httpClientService.sendRequest({
                        method: 'GET',
                        url: '/api/lectures/get-by-author-id/' + authorId
                    }, handler);
                },
                getLectureById: function (lectureId, handler) {
                    httpClientService.sendRequest({
                        method: 'GET',
                        url: '/api/lectures/get-by-id/' + lectureId
                    }, handler);
                },
                getStatisticForLecture: function (lectureId, handler) {
                    httpClientService.sendRequest({
                        method: 'GET',
                        url: '/api/lectures/' + lectureId + '/statistic'
                    }, handler);
                },
                updateStatisticForLecture: function (lectureId, data, handler) {
                    httpClientService.sendRequest({
                        method: 'POST',
                        data: data,
                        url: '/api/lectures/' + lectureId + '/statistic/update'
                    }, handler);
                },
                getActiveLectures: function (handler) {
                    httpClientService.sendRequest({
                        method: 'GET',
                        url: '/api/lectures/active'
                    }, handler);
                },
                updateLectureStatus: function (lectureId, status, handler) {
                    httpClientService.sendRequest({
                        method: 'POST',
                        data: {
                            status: status
                        },
                        url: '/api/lectures/' + lectureId + '/update-status'
                    }, handler);
                },
                createQuestion: function (lectureId, title, handler) {
                    httpClientService.sendRequest({
                        method: 'POST',
                        data: {
                            lectureId: lectureId,
                            title: title
                        },
                        url: '/api/questions/create'
                    }, handler);
                },
                updateQuestion: function (questionId, title, handler) {
                    httpClientService.sendRequest({
                        method: 'POST',
                        data: {
                            title: title
                        },
                        url: '/api/questions/' + questionId + '/update'
                    }, handler);
                },
                removeQuestion: function (questionId, handler) {
                    httpClientService.sendRequest({
                        method: 'GET',
                        url: '/api/questions/' + questionId + '/remove'
                    }, handler);
                },
                getQuestionsByLectureId: function (lectureId, handler) {
                    httpClientService.sendRequest({
                        method: 'GET',
                        url: '/api/questions/get-by-lecture-id/' + lectureId
                    }, handler);
                },
                getQuestionById: function (questionId, handler) {
                    httpClientService.sendRequest({
                        method: 'GET',
                        url: '/api/questions/get-by-id/' + questionId
                    }, handler);
                }
            };
        }
    ]
);