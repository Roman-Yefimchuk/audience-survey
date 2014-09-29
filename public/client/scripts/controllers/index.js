"use strict";

angular.module('application')

    .controller('IndexController', [

        '$scope',
        'loaderService',

        function ($scope, loaderService) {

            function showLoader() {
                loaderService.showLoader();
            }

            $scope.showLoader = showLoader;
        }
    ]
);
