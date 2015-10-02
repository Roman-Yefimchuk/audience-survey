"use strict";

angular.module('application')

    .service('usersService', [

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