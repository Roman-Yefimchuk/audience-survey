"use strict";

angular.module('application')

    .controller('SignUpController', [

        '$scope',
        '$location',
        'loaderService',
        'apiService',
        'NAME_PATTERN',
        'PASSWORD_PATTERN',

        function ($scope, $location, loaderService, apiService, NAME_PATTERN, PASSWORD_PATTERN) {

            function isNameValid() {
                var name = ($scope.name || '');
                return NAME_PATTERN.test(name);
            }

            function isPasswordValid() {
                var password = ($scope['password'] || '').toLowerCase();
                return PASSWORD_PATTERN.test(password) && $scope.password == $scope.retypedPassword;
            }

            function quickSingUp() {

                return;

                $scope.name = 'Роман Єфімчук';
                $scope.password = 'qwerty';

                $scope.$watch('name', function () {
                    $scope.signUp();
                });
            }

            function signUp() {

                loaderService.showLoader();

                apiService.signUp({
                    name: $scope.name,
                    password: $scope.password
                }, {
                    success: function (response) {
                        $location.path('/lectures-list');
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

            $scope.isNameValid = isNameValid;
            $scope.isPasswordValid = isPasswordValid;
            $scope.quickSingUp = quickSingUp;
            $scope.signUp = signUp;
        }
    ]
);
