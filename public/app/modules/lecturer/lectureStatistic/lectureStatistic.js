"use strict";

angular.module('lecturer.lectureStatistic', [

    'genericHeader',
    'lecturer.lectureStatistic.statisticChart'

]).controller('LectureStatisticController', [

        '$scope',
        '$routeParams',
        'user',
        'statisticCharts',

        function ($scope, $routeParams, user, statisticCharts) {

            $scope.user = user;
            $scope.statisticCharts = statisticCharts;
        }
    ]
);
