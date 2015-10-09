"use strict";

angular.module('lecturer.lecturerActiveLecture.tabs.lecturerSurveyTab', [

    'chart.js'

]).controller('LecturerSurveyTabController', [

        '$scope',
        'savedState',
        'pieChartModel',

        function ($scope, savedState, pieChartModel) {

            $scope.pieChartModel = pieChartModel;
        }
    ]
);
