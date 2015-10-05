"use strict";

angular.module('services.api.usersService', [

    'services.httpClientService'

]).service('usersService', [

        '$q',
        'httpClientService',

        function ($q, httpClientService) {

            function getUser(userId) {
                return httpClientService.get('users/' + userId);
            }

            function getUserName(userId) {
                return httpClientService.get('users/' + userId + '/name');
            }

            return {
                getUser: getUser,
                getUserName: getUserName
            };
        }
    ]
);