"use strict";

angular.module('application')

    .controller('LoginController', [

        '$scope',
        '$rootScope',
        '$location',
        'apiService',
        'loaderService',
        'EMAIL_PATTERN',
        'PASSWORD_PATTERN',
        'DEBUG_MODE',

        function ($scope, $rootScope, $location, apiService, loaderService, EMAIL_PATTERN, PASSWORD_PATTERN, DEBUG_MODE) {

            function isEmailValid() {
                var email = ($scope['email'] || '').toLowerCase();
                return EMAIL_PATTERN.test(email);
            }

            function isPasswordValid() {
                var password = ($scope['password'] || '').toLowerCase();
                return PASSWORD_PATTERN.test(password);
            }

            function quickUserLogin() {
                if (DEBUG_MODE) {
                    $scope.email = 'user@test.com';
                    $scope.password = 'qwerty';

                    login();
                }
            }

            function quickAdminLogin() {
                if (DEBUG_MODE) {
                    $scope.email = 'admin@test.com';
                    $scope.password = 'qwerty';

                    login();
                }
            }

            function login() {

                loaderService.showLoader();

                apiService.login({
                    email: $scope.email,
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
            $scope.email = "";
            $scope.password = "";
            $scope.DEBUG_MODE = DEBUG_MODE;

            $scope.isEmailValid = isEmailValid;
            $scope.isPasswordValid = isPasswordValid;
            $scope.login = login;

            $scope.quickUserLogin = quickUserLogin;
            $scope.quickAdminLogin = quickAdminLogin;
        }
    ]
);
