"use strict";

angular.module('signUp', [

    'services.api.authService',
    'services.oauthService',
    'services.profileExtractorService',
    'constants'

]).controller('SignUpController', [

        '$scope',
        '$location',
        'authService',
        'oauthService',
        'profileExtractorService',
        'NAME_PATTERN',
        'EMAIL_PATTERN',
        'PASSWORD_PATTERN',

        function ($scope, $location, authService, oauthService, profileExtractorService, namePattern, emailPattern, passwordPattern) {

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
                return namePattern.test(name);
            }

            function isEmailValid() {
                var email = ($scope.email || '');
                return emailPattern.test(email);
            }

            function isPasswordValid() {
                var password = ($scope['password'] || '').toLowerCase();
                return passwordPattern.test(password) && $scope.password == $scope.retypedPassword;
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
                    $scope.errorMessage = error.message || error;
                });
            }

            function externalSignUp(providerId) {

                oauthService.authorize(providerId)
                    .then(function (account) {

                        profileExtractorService.extractProfile(account)
                            .then(function (data) {

                                authService.externalSignUp({
                                    genericId: data.genericId,
                                    name: data.name,
                                    email: data.email,
                                    role: $scope.role['id'],
                                    isEmailVerified: data.isEmailVerified,
                                    authorizationProvider: providerId
                                }).then(function (response) {

                                    if (response.userRole == 'lecturer') {
                                        $location.path('/lecturers/' + response.userId + '/lectures');
                                    } else {
                                        $location.path('/listeners/' + response.userId + '/activeLectures');
                                    }
                                }, function (error) {
                                    $scope.errorMessage = error.message || error;
                                });
                            }, function (error) {

                                if (error) {
                                    $scope.errorMessage = error.message || error;
                                }
                            });
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
            $scope.externalSignUp = externalSignUp;
        }
    ]
);
