"use strict";

angular.module('application')

    .controller('LoginController', [

        '$scope',
        '$rootScope',
        '$location',
        'apiService',
        'loaderService',
        'NAME_PATTERN',
        'PASSWORD_PATTERN',
        'DEBUG_MODE',

        function ($scope, $rootScope, $location, apiService, loaderService, NAME_PATTERN, PASSWORD_PATTERN, DEBUG_MODE) {

            function isNameValid() {
                var name = ($scope['name'] || '').toLowerCase();
                return NAME_PATTERN.test(name);
            }

            function isPasswordValid() {
                var password = ($scope['password'] || '').toLowerCase();
                return PASSWORD_PATTERN.test(password);
            }

            function quickUserLogin() {
                if (DEBUG_MODE) {
                    $scope.name = 'User';
                    $scope.password = 'qwerty';

                    login();
                }
            }

            function quickAdminLogin() {
                if (DEBUG_MODE) {
                    $scope.name = 'Admin';
                    $scope.password = 'qwerty';

                    login();
                }
            }

            function login() {

                loaderService.showLoader();

                apiService.login({
                    name: $scope.name,
                    password: $scope.password
                }, {
                    success: function (response) {
                        var user = response.user;
                        if (user.role == 'admin') {
                            $location.path('/administration');
                        } else {
                            $location.path('/lectures-list');
                        }
                    },
                    failure: function (error) {
                        $scope.errorMessage = error.message;
                        loaderService.hideLoader();
                    }
                });
            }

            $scope.errorMessage = null;
            $scope.name = "";
            $scope.password = "";
            $scope.DEBUG_MODE = DEBUG_MODE;

            $scope.isNameValid = isNameValid;
            $scope.isPasswordValid = isPasswordValid;
            $scope.login = login;

            $scope.quickUserLogin = quickUserLogin;
            $scope.quickAdminLogin = quickAdminLogin;
        }
    ]
);
