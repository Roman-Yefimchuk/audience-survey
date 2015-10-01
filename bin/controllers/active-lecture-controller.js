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
            routePrefix: 'users/:userId/activeLectures',
            actions: [
                {
                    route: '',
                    method: 'get',
                    params: ['userId'],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId')
                    ],
                    handler: function (userId) {

                        return Promise(function (resolve, reject) {

                            SocketProvider.getActiveLectures()
                                .then(function (activeLectures) {
                                    resolve(activeLectures);
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: ':lectureId',
                    method: 'get',
                    params: ['userId', 'lectureId'],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId')
                    ],
                    handler: function (userId, lectureId) {

                        return Promise(function (resolve, reject) {

                            SocketProvider.getActiveLecture(lectureId)
                                .then(function (activeLecture) {
                                    resolve(activeLecture);
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: ':lectureId/start',
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
                    route: ':lectureId/suspend',
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
                    route: ':lectureId/resume',
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
                    route: ':lectureId/stop',
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
                },
                {
                    route: ':lectureId/sendMessage',
                    method: 'post',
                    params: ['userId', 'lectureId', model()],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId')
                    ],
                    handler: function (userId, lectureId, model) {

                        return Promise(function (resolve, reject) {

                            SocketProvider.sendMessage(userId, lectureId, model)
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