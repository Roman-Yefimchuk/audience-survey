"use strict";

(function (require) {

    var Q = require('q');
    var Promise = Q['promise'];

    var LectureRepository = require('./../db/data-access-layers/lecture-repository');
    var ControllerUtils = require('./../utils/controller-utils');
    var RequestFilter = require('./../request-filter');

    function model() {
        return new ControllerUtils.RequestResolver('body');
    }

    module.exports = function (controller) {
        return controller({
            routePrefix: 'users/:userId/lectures',
            actions: [
                {
                    route: '',
                    method: 'get',
                    params: ['userId'],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId'),
                        RequestFilter.checkRole(['lecturer'])
                    ],
                    handler: function (lecturerId) {

                        return Promise(function (resolve, reject) {

                            LectureRepository.getLectures(lecturerId)
                                .then(function (lectures) {
                                    resolve(lectures);
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: 'create',
                    method: 'post',
                    params: ['userId', model()],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId'),
                        RequestFilter.checkRole(['lecturer'])
                    ],
                    handler: function (lecturerId, model) {

                        return Promise(function (resolve, reject) {

                            LectureRepository.createLecture(lecturerId, model)
                                .then(function (lecture) {
                                    resolve(lecture);
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: ':lectureId',
                    method: 'get',
                    params: ['lectureId'],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId')
                    ],
                    handler: function (lectureId) {

                        return Promise(function (resolve, reject) {

                            LectureRepository.getLecture(lectureId)
                                .then(function (lecture) {
                                    resolve(lecture);
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: ':lectureId/update',
                    method: 'post',
                    params: ['lectureId', model()],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId'),
                        RequestFilter.checkRole(['lecturer'])
                    ],
                    handler: function (lectureId, model) {

                        return Promise(function (resolve, reject) {

                            LectureRepository.updateLecture(lectureId, model)
                                .then(function () {
                                    resolve();
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: ':lectureId/remove',
                    method: 'get',
                    params: ['lectureId'],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId'),
                        RequestFilter.checkRole(['lecturer'])
                    ],
                    handler: function (lectureId) {

                        return Promise(function (resolve, reject) {

                            LectureRepository.removeLecture(lectureId)
                                .then(function () {
                                    resolve();
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