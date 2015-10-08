"use strict";

angular.module('lecturer.lectureStatistic.statisticChart', [

    'filters.formatTime',
    'filters.formatDate'

]).directive('statisticChart', [

    '$rootScope',
    '$filter',

    function ($rootScope, $filter) {

        function round(n, s) {
            return parseFloat(n.toFixed(s));
        }

        function parseLineChartModel(chartPoints) {
            return {
                options: {
                    animation: false
                },
                labels: (function () {
                    var labels = (function () {
                        if (chartPoints.length > 0) {
                            return ["00:00"];
                        }
                        return ["00:00", "01:00"];
                    })();
                    _.forEach(chartPoints, function (chartPoint) {
                        labels.push($filter('formatTime')(chartPoint.timestamp, '@{minutes}:@{seconds}'));
                    });
                    return labels;
                })(),
                series: ['Кількість слухачів', 'Відсоток розуміння'],
                data: [
                    (function () {
                        var data = (function () {
                            if (chartPoints.length > 0) {
                                return [0];
                            }
                            return [0, 0];
                        })();
                        _.forEach(chartPoints, function (chartPoint) {
                            data.push(chartPoint.presentListeners);
                        });
                        return data;
                    })(),
                    (function () {
                        var data = (function () {
                            if (chartPoints.length > 0) {
                                return [0];
                            }
                            return [0, 0];
                        })();
                        _.forEach(chartPoints, function (chartPoint) {
                            data.push(round((chartPoint.understandingPercentage * chartPoint.presentListeners) / 100, 1));
                        });
                        return data;
                    })()
                ]
            };
        }

        return {
            scope: {
                model: '=statisticChart'
            },
            templateUrl: '/public/app/modules/lecturer/lectureStatistic/statisticChart/statisticChart.html',
            controller: ['$scope', function ($scope) {
                $scope.lineChartModel = parseLineChartModel($scope.model['chartPoints']);
            }]
        };
    }
]);