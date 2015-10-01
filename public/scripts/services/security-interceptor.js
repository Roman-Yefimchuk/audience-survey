"use strict";

angular.module('application')

    .service('securityInterceptorService', [

        '$q',
        '$cookies',
        '$location',
        'notificationsService',

        function ($q, $cookies, $location, notificationsService) {

            return {
                request: function (config) {

                    if ($cookies.token) {
                        config.headers['X-Access-Token'] = $cookies.token;
                    }

                    return config;
                },
                responseError: function (response) {

                    switch (response.status) {
                        case 400:
                        {
                            if (_.indexOf([
                                'AUTHENTICATION.TOKEN_EXPIRED',
                                'AUTHENTICATION.BAD_TOKEN',
                                'AUTHENTICATION.INVALID_TOKEN'
                            ], (response.data || {}).code) != -1) {
                                $location.path('/sign-in');
                            }
                            break;
                        }
                        case 401:
                        {
                            $location.path('/sign-in');
                            break;
                        }
                        case 403:
                        {
                            notificationsService.error('Доступ заборонено');
                            break;
                        }
                    }

                    return $q.reject(response);
                }
            };
        }
    ]
);