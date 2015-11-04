"use strict";

angular.module('lecturer.lecturerActiveLecture.tabs.lecturerInfoTab', [])

    .controller('LecturerInfoTabController', [

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
