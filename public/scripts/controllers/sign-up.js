"use strict";

angular.module('application')

    .controller('SignUpController', [

        '$scope',
        '$location',
        'authService',
        'NAME_PATTERN',
        'EMAIL_PATTERN',
        'PASSWORD_PATTERN',

        function ($scope, $location, authService, NAME_PATTERN, EMAIL_PATTERN, PASSWORD_PATTERN) {

            var roles = [
                {
                    id: 'listener',
                    name: 'Слухач'
                },
                {
                    id: 'lecturer',
                    name: 'Лектор'
                }
            ];

            function isNameValid() {
                var name = ($scope.name || '');
                return NAME_PATTERN.test(name);
            }

            function isEmailValid() {
                var email = ($scope.email || '');
                return EMAIL_PATTERN.test(email);
            }

            function isPasswordValid() {
                var password = ($scope['password'] || '').toLowerCase();
                return PASSWORD_PATTERN.test(password) && $scope.password == $scope.retypedPassword;
            }

            function setRole(role) {
                $scope.role = role;
            }

            function signUp() {

                authService.signUp({
                    name: $scope.name,
                    email: $scope.email,
                    password: $scope.password,
                    role: $scope.role['id']
                }).then(function (response) {
                    if (response.userRole == 'lecturer') {
                        $location.path('/lecturers/' + response.userId + '/lectures');
                    } else {
                        $location.path('/listeners/' + response.userId + '/activeLectures');
                    }
                }, function (error) {
                    $scope.errorMessage = error.message;
                });
            }

            $scope.errorMessage = null;
            $scope.name = "";
            $scope.password = "";
            $scope.retypedPassword = "";
            $scope.roles = roles;
            $scope.role = _.findWhere(roles, {
                id: 'listener'
            });

            $scope.isNameValid = isNameValid;
            $scope.isEmailValid = isEmailValid;
            $scope.isPasswordValid = isPasswordValid;
            $scope.setRole = setRole;
            $scope.signUp = signUp;

            $scope.quickSignUpAsLecturer = function () {

                $scope.name = 'Lecturer';
                $scope.email = 'lecturer@mail.com';
                $scope.password = 'qwerty';
                $scope.role = _.findWhere(roles, {
                    id: 'lecturer'
                });

                signUp();
            };

            $scope.quickSignUpAsListener = function () {

                $scope.name = 'Listener';
                $scope.email = 'listener@mail.com';
                $scope.password = 'qwerty';
                $scope.role = _.findWhere(roles, {
                    id: 'listener'
                });

                signUp();
            };
        }
    ]
);
