"use strict";

(function (require) {

    var Q = require('q');
    var Promise = Q['promise'];

    var LinkRepository = require('./../db/data-access-layers/link-repository');
    var ControllerUtils = require('./../utils/controller-utils');
    var RequestFilter = require('./../request-filter');

    function model() {
        return new ControllerUtils.RequestResolver('body');
    }

    module.exports = function (controller) {
        return controller({
            routePrefix: 'users/:userId/lectures/:lectureId/links',
            actions: [
                {
                    route: '',
                    method: 'get',
                    params: ['lectureId'],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId')
                    ],
                    handler: function (lectureId) {

                        return Promise(function (resolve, reject) {

                            LinkRepository.getLinks(lectureId)
                                .then(function (links) {
                                    resolve(links);
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

                            LinkRepository.createLink(lectureId, model)
                                .then(function (linkId) {
                                    resolve({
                                        linkId: linkId
                                    });
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: ':linkId/update',
                    method: 'post',
                    params: ['linkId', model()],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId'),
                        RequestFilter.checkRole(['lecturer'])
                    ],
                    handler: function (linkId, model) {

                        return Promise(function (resolve, reject) {

                            LinkRepository.updateLink(linkId, model)
                                .then(function () {
                                    resolve();
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: ':linkId/remove',
                    method: 'get',
                    params: ['lectureId', 'linkId'],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId'),
                        RequestFilter.checkRole(['lecturer'])
                    ],
                    handler: function (lectureId, linkId) {

                        return Promise(function (resolve, reject) {

                            LinkRepository.removeLink(lectureId, linkId)
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