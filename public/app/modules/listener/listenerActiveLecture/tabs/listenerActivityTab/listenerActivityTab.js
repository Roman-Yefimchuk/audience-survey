"use strict";

angular.module('listener.listenerActiveLecture.tabs.listenerActivityTab', [

    'filters.formatDate'

]).controller('ListenerActivityTabController', [

        '$scope',
        'savedState',
        'userId',
        'activityManager',
        'socketConnection',

        function ($scope, savedState, userId, activityManager, socketConnection) {

            function sendMessage() {

                socketConnection.emit('send_message', {
                    userId: userId,
                    message: $scope.messageText
                });

                $scope.messageText = '';
            }

            $scope.activityManager = activityManager;
            $scope.messageText = savedState.messageText || '';

            $scope.sendMessage = sendMessage;

            $scope.$watch('messageText', function (messageText) {
                savedState.messageText = messageText;
            });
        }
    ]
);
