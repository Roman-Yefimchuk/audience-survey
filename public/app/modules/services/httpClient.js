'use strict';

angular.module('services.httpClientService', [

    'services.securityInterceptorService'

]).service('httpClientService', [

        '$q',
        '$http',

        function ($q, $http) {

            return {
                get: function (url) {

                    return $q(function (resolve, reject) {

                        $http.get(url)
                            .success(function (response) {
                                resolve(response);
                            })
                            .error(function (e) {
                                reject(e);
                            });
                    });
                },
                post: function (url, data) {

                    return $q(function (resolve, reject) {

                        $http.post(url, data)
                            .success(function (response) {
                                resolve(response);
                            })
                            .error(function (e) {
                                reject(e);
                            });
                    });
                }
            };
        }
    ]
).config([

        '$httpProvider',

        function ($httpProvider) {

            var interceptors = $httpProvider.interceptors;
            interceptors.push('securityInterceptorService');
        }
    ]);