"use strict";

angular.module('lecturer.lecturerActiveLecture.tabs.lecturerInfoTab', [])

    .controller('LecturerInfoTabController', [

        '$scope',
        'savedState',
        'lecture',

        function ($scope, savedState, lecture) {

            $scope.lecture = lecture;
        }
    ]
);
