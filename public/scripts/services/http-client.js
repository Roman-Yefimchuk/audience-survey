'use strict';

angular.module('application')

    .service('httpClientService', [

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
);