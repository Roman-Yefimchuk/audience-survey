"use strict";

angular.module('lecturer.lecturerActiveLecture.tabs.lecturerActivityTab', [

    'filters.formatDate'

]).controller('LecturerActivityTabController', [

        '$scope',
        'savedState',
        'activityManager',

        function ($scope, savedState, activityManager) {

            $scope.activityManager = activityManager;
        }
    ]
);
