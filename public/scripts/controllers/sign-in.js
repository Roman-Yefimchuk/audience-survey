"use strict";

angular.module('application')

    .controller('SignInController', [

        '$scope',
        '$rootScope',
        '$location',
        'authService',
        'oauthService',
        'EMAIL_PATTERN',
        'PASSWORD_PATTERN',

        function ($scope, $rootScope, $location, authService, oauthService, EMAIL_PATTERN, PASSWORD_PATTERN) {

            function isEmailValid() {
                var email = ($scope['email'] || '').toLowerCase();
                return EMAIL_PATTERN.test(email);
            }

            function isPasswordValid() {
                var password = ($scope['password'] || '').toLowerCase();
                return PASSWORD_PATTERN.test(password);
            }

            function signIn() {

                authService.signIn({
                    email: $scope.email,
                    password: $scope.password
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

            function externalSignIn(providerId) {
                oauthService.authorize(providerId)
                    .then(function (account) {
                        var profileId = account.profile['id'];
                        authService.externalSignIn(profileId)
                            .then(function (response) {
                                if (response.userRole == 'lecturer') {
                                    $location.path('/lecturers/' + response.userId + '/lectures');
                                } else {
                                    $location.path('/listeners/' + response.userId + '/activeLectures');
                                }
                            }, function (error) {
                                $scope.errorMessage = error.message || error;
                            });
                    });
            }

            $scope.errorMessage = null;
            $scope.email = "";
            $scope.password = "";

            $scope.isEmailValid = isEmailValid;
            $scope.isPasswordValid = isPasswordValid;
            $scope.signIn = signIn;
            $scope.externalSignIn = externalSignIn;
        }
    ]
);
