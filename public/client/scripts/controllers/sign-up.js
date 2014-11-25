"use strict";

angular.module('application')

    .controller('SignUpController', [

        '$scope',
        '$location',
        'loaderService',
        'apiService',
        'NAME_PATTERN',
        'PASSWORD_PATTERN',
        'DEBUG_MODE',

        function ($scope, $location, loaderService, apiService, NAME_PATTERN, PASSWORD_PATTERN, DEBUG_MODE) {

            function isNameValid() {
                var name = ($scope.name || '');
                return NAME_PATTERN.test(name);
            }

            function isPasswordValid() {
                var password = ($scope['password'] || '').toLowerCase();
                return PASSWORD_PATTERN.test(password) && $scope.password == $scope.retypedPassword;
            }

            function quickUserSignUp() {

                $scope.name = 'User';
                $scope.password = 'qwerty';

                signUp('user');
            }

            function quickAdminSignUp() {

                $scope.name = 'Admin';
                $scope.password = 'qwerty';

                signUp('admin');
            }

            function signUp(role) {

                loaderService.showLoader();

                apiService.signUp({
                    name: $scope.name,
                    password: $scope.password,
                    role: role || 'user'
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
            $scope.retypedPassword = "";
            $scope.DEBUG_MODE = DEBUG_MODE;

            $scope.isNameValid = isNameValid;
            $scope.isPasswordValid = isPasswordValid;
            $scope.signUp = signUp;

            $scope.quickUserSignUp = quickUserSignUp;
            $scope.quickAdminSignUp = quickAdminSignUp;
        }
    ]
);
