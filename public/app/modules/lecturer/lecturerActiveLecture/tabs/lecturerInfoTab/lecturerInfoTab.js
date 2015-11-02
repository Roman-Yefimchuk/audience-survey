"use strict";

angular.module('lecturer.lecturerActiveLecture.tabs.lecturerInfoTab', [])

    .controller('LecturerInfoTabController', [

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
