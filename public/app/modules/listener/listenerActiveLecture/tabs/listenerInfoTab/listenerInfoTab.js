"use strict";

angular.module('listener.listenerActiveLecture.tabs.listenerInfoTab', [])

    .controller('ListenerInfoTabController', [

        '$scope',
        'savedState',
        'lecture',
        '$sce',

        function ($scope, savedState, lecture, $sce) {
            function getHtmlContent(link) {
                return $sce.trustAsHtml(_.unescape(link.data.html));
            }
            $scope.getHtmlContent = getHtmlContent;
            $scope.lecture = lecture;
        }
    ]
);
