"use strict";

angular.module('services.api.authService', [

    'services.httpClientService'

]).service('authService', [

        '$q',
        '$cookies',
        'httpClientService',

        function ($q, $cookies, httpClientService) {

            function signIn(data) {

                return $q(function (resolve, reject) {
                    httpClientService.post('/auth/signIn', data)
                        .then(function (authSession) {

                            $cookies.userId = authSession.userId;
                            $cookies.userRole = authSession.userRole;
                            $cookies.token = authSession.token;

                            resolve({
                                userId: authSession.userId,
                                userRole: authSession.userRole
                            });
                        }, function (e) {
                            reject(e);
                        });
                });
            }

            function signUp(data) {

                return $q(function (resolve, reject) {
                    httpClientService.post('/auth/signUp', data)
                        .then(function (authSession) {

                            $cookies.userId = authSession.userId;
                            $cookies.userRole = authSession.userRole;
                            $cookies.token = authSession.token;

                            resolve({
                                userId: authSession.userId,
                                userRole: authSession.userRole
                            });
                        }, function (e) {
                            reject(e);
                        });
                });
            }

            function externalSignIn(profileId) {

                return $q(function (resolve, reject) {
                    httpClientService.post('/auth/externalSignIn', {
                        profileId: profileId
                    }).then(function (authSession) {

                        $cookies.userId = authSession.userId;
                        $cookies.userRole = authSession.userRole;
                        $cookies.token = authSession.token;

                        resolve({
                            userId: authSession.userId,
                            userRole: authSession.userRole
                        });
                    }, function (e) {
                        reject(e);
                    });
                });
            }

            function externalSignUp(data) {

                return $q(function (resolve, reject) {
                    httpClientService.post('/auth/externalSignUp', data)
                        .then(function (authSession) {

                            $cookies.userId = authSession.userId;
                            $cookies.userRole = authSession.userRole;
                            $cookies.token = authSession.token;

                            resolve({
                                userId: authSession.userId,
                                userRole: authSession.userRole
                            });
                        }, function (e) {
                            reject(e);
                        });
                });
            }

            function logout() {
                return $q(function (resolve, reject) {
                    httpClientService.get('/auth/logout')
                        .then(function () {

                            $cookies.userId = null;
                            $cookies.userRole = null;
                            $cookies.token = null;

                            resolve();
                        }, function (e) {
                            reject(e);
                        });
                });
            }

            return {
                signIn: signIn,
                signUp: signUp,
                externalSignIn: externalSignIn,
                externalSignUp: externalSignUp,
                logout: logout
            };
        }
    ]
);