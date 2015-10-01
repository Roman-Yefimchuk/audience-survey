"use strict";

angular.module('application')

    .service('usersService', [

        '$q',
        'httpClientService',

        function ($q, httpClientService) {

            function getUser(userId) {
                return httpClientService.get('users/' + userId);
            }

            return {
                getUser: getUser
            };
        }
    ]
);