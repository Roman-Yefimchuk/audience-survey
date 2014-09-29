'use strict';

angular.module('application')

    .service('userService', [

        '$rootScope',
        'sessionManagerService',

        function ($rootScope, sessionManagerService) {

            var user = null;

            $rootScope.$on('user:updateProfile', function (event, data) {
                user = angular.extend(data, user || {});
            });

            return {
                getData: function (handler) {

                    var successCallback = function (user, externalNotification) {
                        (handler.success || angular.noop)(user, externalNotification);
                    };

                    var failureCallback = function (error) {
                        (handler.failure || angular.noop)(error);
                    };

                    sessionManagerService.isAuthenticated({
                        success: function (response) {
                            if (response.isAuthenticated) {
                                if (user) {
                                    successCallback(user);
                                } else {
                                    sessionManagerService.getUserData({
                                        success: function (user) {
                                            successCallback(user);
                                        },
                                        failure: function (error) {
                                            failureCallback(error);
                                        }
                                    });
                                }
                            } else {
                                failureCallback({
                                    status: 'NOT_AUTHENTICATED',
                                    message: 'You are not authenticated'
                                });
                            }
                        },
                        failure: function (error) {
                            failureCallback(error);
                        }
                    });
                },
                logout: function (callback) {
                    sessionManagerService.logout({
                        success: function () {
                            user = null;
                            callback();
                        },
                        failure: function () {
                            user = null;
                            callback();
                        }
                    });
                }
            };
        }
    ]
);
