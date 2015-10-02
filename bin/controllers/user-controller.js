"use strict";

(function (require) {

    var Q = require('q');
    var Promise = Q['promise'];

    var UserRepository = require('./../db/data-access-layers/user-repository');
    var RequestFilter = require('./../request-filter');

    module.exports = function (controller) {
        return controller({
            routePrefix: 'users',
            actions: [
                {
                    route: ':userId',
                    method: 'get',
                    params: ['userId'],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId')
                    ],
                    handler: function (userId) {

                        return Promise(function (resolve, reject) {

                            UserRepository.getUser(userId)
                                .then(function (user) {
                                    resolve(user);
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: ':userId/name',
                    method: 'get',
                    params: ['userId'],
                    filters: [
                        RequestFilter.checkAuthorization()
                    ],
                    handler: function (userId) {

                        return Promise(function (resolve, reject) {

                            UserRepository.getUserName(userId)
                                .then(function (name) {
                                    resolve({
                                        name: name
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