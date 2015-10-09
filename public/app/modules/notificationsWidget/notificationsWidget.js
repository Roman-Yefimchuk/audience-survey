"use strict";

angular.module('notificationsWidget', [

    'services.notificationsService'

]).directive('notificationsWidget', [

        '$timeout',
        'notificationsService',

        function ($timeout, notificationsService) {
            return {
                replace: true,
                templateUrl: '/public/app/modules/notificationsWidget/notificationWidget.html',
                controller: ['$scope', function ($scope) {

                    $scope.notifications = [];
                    $scope.icons = {
                        success: 'fa-check-circle',
                        info: 'fa-info-circle',
                        warning: 'fa-exclamation-triangle',
                        danger: 'fa-exclamation-circle'
                    };

                    notificationsService.onNotification(function (notification) {

                        var notifications = $scope.notifications;
                        notifications.unshift(notification);

                        $timeout(function () {
                            $scope.notifications = _.without($scope.notifications, notification);
                        }, notification['autoHideDelay'] || 1000);
                    });
                }]
            };
        }
    ]
);