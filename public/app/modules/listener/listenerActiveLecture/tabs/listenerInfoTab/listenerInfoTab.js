"use strict";

angular.module('listener.listenerActiveLecture.tabs.listenerInfoTab', [])

    .controller('ListenerInfoTabController', [

        '$scope',
        'savedState',
        'lecture',
        '$sce',
        'utilsService',

        function ($scope, savedState, lecture, $sce, utilsService) {

            $scope.getTrustHtmlContent = utilsService.getTrustHtmlContent;
            $scope.lecture = lecture;
        }
    ]
);
