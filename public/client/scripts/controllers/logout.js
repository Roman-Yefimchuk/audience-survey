"use strict";

angular.module('application')

    .controller('LogoutController', [

        '$scope',
        '$location',
        'socketsService',
        'sessionManagerService',

        function ($scope, $location, socketsService, sessionManagerService) {
            sessionManagerService.logout(function () {
                socketsService.closeConnection();
                $location.path('/');
            });
        }
    ]
);
