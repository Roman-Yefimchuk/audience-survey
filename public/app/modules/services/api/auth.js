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

            function checkToken() {
                return $q(function (resolve, reject) {

                    if ($cookies.token) {

                        httpClientService.get('/auth/checkToken?token=' + $cookies.token)
                            .then(function (result) {
                                resolve(result);
                            }, function (e) {
                                reject(e);
                            });
                    } else {

                        resolve({
                            isAuthorized: false
                        });
                    }
                });
            }

            function quickSignIn() {

                return $q(function (resolve, reject) {

                    if ($cookies.userId && $cookies.userRole && $cookies.token) {

                        httpClientService.get('/auth/checkToken?token=' + $cookies.token)
                            .then(function (result) {

                                if (result.isAuthorized) {

                                    resolve(function ($location) {
                                        if ($cookies.userRole == 'lecturer') {
                                            $location.path('/lecturers/' + $cookies.userId + '/lectures');
                                        } else {
                                            $location.path('/listeners/' + $cookies.userId + '/activeLectures');
                                        }
                                    });
                                } else {
                                    reject();
                                }
                            }, function () {
                                reject();
                            });
                    } else {

                        reject();
                    }
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
                quickSignIn: quickSignIn,
                logout: logout
            };
        }
    ]
);