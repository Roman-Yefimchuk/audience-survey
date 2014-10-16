"use strict";

angular.module('application')

    .controller('IndexController', [

        '$scope',
        '$location',
        'loaderService',
        'apiService',

        function ($scope, $location, loaderService, apiService) {

            function showLoader() {
                loaderService.showLoader();
            }

            $scope.showLoader = showLoader;

            $scope.quickUserLogin = function () {

                return;

                loaderService.showLoader();

                apiService.login({
                    name: 'TEST_USER',
                    password: 'TEST_USER'
                }, {
                    success: function (response) {
                        $location.path('/lectures-list');
                    },
                    failure: function (error) {
                        alert(error.message);
                        loaderService.hideLoader();
                    }
                });
            }
        }
    ]
);
