"use strict";

angular.module('services.notificationsService', [])

    .service('notificationsService', [

        '$timeout',

        function ($timeout) {

            var onNotificationCallback = function () {
            };

            function showNotification(message, type, data) {
                if (message) {

                    if (data) {
                        message = message.format(data);
                    }

                    $timeout(function () {
                        onNotificationCallback({
                            message: message,
                            type: type,
                            autoHideDelay: 3000,
                            closeable: true
                        });
                    });
                }
            }

            return {
                onNotification: function (callback) {
                    onNotificationCallback = callback || function () {
                    };
                },
                notify: function (message, type, data) {
                    showNotification(message, type, data);
                },
                success: function (message, data) {
                    showNotification(message, 'success', data);
                },
                info: function (message, data) {
                    showNotification(message, 'info', data);
                },
                warning: function (message, data) {
                    showNotification(message, 'warning', data);
                },
                error: function (message, data) {
                    showNotification(message, 'danger', data);
                }
            };
        }
    ]
)
;