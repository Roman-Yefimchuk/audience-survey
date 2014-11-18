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

            function quickLogin() {
                if (DEBUG_MODE) {
                    $scope.name = 'Роман Єфімчук';
                    $scope.password = 'qwerty';

                    $scope.$watch('email', function () {
                        login();
                    });
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

            $scope.isNameValid = isNameValid;
            $scope.isPasswordValid = isPasswordValid;
            $scope.quickLogin = quickLogin;
            $scope.login = login;
        }
    ]
);
