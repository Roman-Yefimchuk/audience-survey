"use strict";

angular.module('application')

    .controller('StatisticController', [

        '$scope',
        '$routeParams',
        'loaderService',

        function ($scope, $routeParams, loaderService) {

            var lectureId = $routeParams.lectureId;
            var completedGraphsCount = 0;

            var event = $scope.$on('statisticGraph:ready', function () {
                if (++completedGraphsCount == $scope.statisticCollection['length']) {
                    event();
                    loaderService.hideLoader();
                }
            });

            $scope.loading = false;
            $scope.statisticCollection = [
                [
                    { year: '2008', value: 32 },
                    { year: '2009', value: 10 },
                    { year: '2010', value: 20 },
                    { year: '2011', value: 3 },
                    { year: '2012', value: 25 }
                ],
                [
                    { year: '2008', value: 20 },
                    { year: '2009', value: 10 },
                    { year: '2010', value: 5 },
                    { year: '2011', value: 5 },
                    { year: '2012', value: 20 }
                ],
                [
                    { year: '2008', value: 40 },
                    { year: '2009', value: 32 },
                    { year: '2010', value: 10 },
                    { year: '2011', value: 14 },
                    { year: '2012', value: 20 }
                ]
            ];

            loaderService.showLoader();
        }
    ]
);
