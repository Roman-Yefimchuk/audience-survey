"use strict";

angular.module('lectureChat', [])

    .directive('lectureChat', [

        function () {
            return {
                scope: {
                    messages: '=lectureChat',
                    onMessageLiked: '&',
                    onMessageDisliked: '&'
                },
                templateUrl: '/public/app/modules/lectureChat/lectureChat.html',
                controller: ['$scope', function ($scope) {

                    function messageLiked() {
                    }

                    function messageDisliked() {
                    }

                    $scope.messageLiked = messageLiked;
                    $scope.messageDisliked = messageDisliked;
                }]
            };
        }
    ]);