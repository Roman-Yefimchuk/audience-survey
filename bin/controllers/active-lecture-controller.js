"use strict";

(function (require) {

    var Q = require('q');
    var Promise = Q['promise'];

    var SocketProvider = require('./../providers/socket-provider');
    var ControllerUtils = require('./../utils/controller-utils');
    var RequestFilter = require('./../request-filter');

    function model() {
        return new ControllerUtils.RequestResolver('body');
    }

    module.exports = function (controller) {
        return controller({
            routePrefix: 'users/:userId',
            actions: [
                {
                    route: 'lecturerActiveLectures',
                    method: 'get',
                    params: ['userId'],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId'),
                        RequestFilter.checkRole(['lecturer'])
                    ],
                    handler: function (userId) {

                        return Promise(function (resolve, reject) {

                            SocketProvider.getLecturerActiveLectures(userId)
                                .then(function (activeLectures) {
                                    resolve(activeLectures);
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: 'lecturerActiveLectures/:lectureId',
                    method: 'get',
                    params: ['userId', 'lectureId'],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId'),
                        RequestFilter.checkRole(['lecturer'])
                    ],
                    handler: function (userId, lectureId) {

                        return Promise(function (resolve, reject) {

                            SocketProvider.getLecturerActiveLecture(lectureId, userId)
                                .then(function (activeLecture) {
                                    resolve(activeLecture);
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: 'listenerActiveLectures',
                    method: 'get',
                    params: ['userId'],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId'),
                        RequestFilter.checkRole(['listener'])
                    ],
                    handler: function (userId) {

                        return Promise(function (resolve, reject) {

                            SocketProvider.getListenerActiveLectures(userId)
                                .then(function (activeLectures) {
                                    resolve(activeLectures);
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: 'listenerActiveLectures/:lectureId',
                    method: 'get',
                    params: ['userId', 'lectureId'],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId'),
                        RequestFilter.checkRole(['listener'])
                    ],
                    handler: function (userId, lectureId) {

                        return Promise(function (resolve, reject) {

                            SocketProvider.getListenerActiveLecture(lectureId, userId)
                                .then(function (activeLecture) {
                                    resolve(activeLecture);
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: 'lecturerActiveLectures/:lectureId/start',
                    method: 'get',
                    params: ['userId', 'lectureId'],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId'),
                        RequestFilter.checkRole(['lecturer'])
                    ],
                    handler: function (userId, lectureId) {

                        return Promise(function (resolve, reject) {

                            SocketProvider.startLecture(lectureId)
                                .then(function (status) {
                                    resolve({
                                        status: status
                                    });
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: 'lecturerActiveLectures/:lectureId/suspend',
                    method: 'get',
                    params: ['userId', 'lectureId'],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId'),
                        RequestFilter.checkRole(['lecturer'])
                    ],
                    handler: function (userId, lectureId) {

                        return Promise(function (resolve, reject) {

                            SocketProvider.suspendLecture(lectureId)
                                .then(function (status) {
                                    resolve({
                                        status: status
                                    });
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: 'lecturerActiveLectures/:lectureId/resume',
                    method: 'get',
                    params: ['userId', 'lectureId'],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId'),
                        RequestFilter.checkRole(['lecturer'])
                    ],
                    handler: function (userId, lectureId) {

                        return Promise(function (resolve, reject) {

                            SocketProvider.resumeLecture(lectureId)
                                .then(function (status) {
                                    resolve({
                                        status: status
                                    });
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: 'lecturerActiveLectures/:lectureId/stop',
                    method: 'get',
                    params: ['userId', 'lectureId'],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId'),
                        RequestFilter.checkRole(['lecturer'])
                    ],
                    handler: function (userId, lectureId) {

                        return Promise(function (resolve, reject) {

                            SocketProvider.stopLecture(lectureId)
                                .then(function (status) {
                                    resolve({
                                        status: status
                                    });
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