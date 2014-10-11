"use strict";

angular.module('application')

    .directive('lectureStatistic', [

        '$rootScope',

        function ($rootScope) {
            return {
                scope: {
                    chartPoints: '=',
                    graphId: '@'
                },
                controller: ['$scope', function ($scope) {

                    var unwatch = $scope.$watch('graphId', function (graphId) {

                        var myLineChart = new Chart(ctx).Line(data, options);

/*                        _.forEach($scope.chartPoints, function (chartPoint) {
                            chartPoint.understandingPercentage /= 100;
                        });

                        Morris.Area({
                            element: angular.element('[graph-id=' + graphId + ']'),
                            data: $scope.chartPoints,
                            xkey: 'timestamp',
                            ykeys: ['presentListeners', 'understandingPercentage'],
                            labels: ['Кількість слухачів', 'Розуміння матеріалу'],
                            pointSize: 2,
                            hideHover: 'auto',
                            resize: true,
                            xLabelFormat: function (x) {
                                return x;
                            },
                            yLabelFormat: function (y) {
                                return y;
                            }
                        });*/

                        unwatch();
                    });
                }]
            };
        }
    ]);