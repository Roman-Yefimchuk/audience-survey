"use strict";

angular.module('lecturer.lectureStatistic.statisticChart', [

    'filters.formatTime',
    'filters.formatDate'

]).directive('statisticChart', [

    '$rootScope',
    '$filter',

    function ($rootScope, $filter) {

        function parseChartModel(chartPoints) {
            return {
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
                datasets: [
                    {
                        label: "My First dataset",
                        fillColor: "rgba(220,220,220,0.2)",
                        strokeColor: "rgba(220,220,220,1)",
                        pointColor: "rgba(220,220,220,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(220,220,220,1)",
                        data: (function () {
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
                        })()
                    },
                    {
                        label: "My First dataset",
                        fillColor: "rgba(151,187,205,0.2)",
                        strokeColor: "rgba(151,187,205,1)",
                        pointColor: "rgba(151,187,205,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(151,187,205,1)",
                        data: (function () {
                            var data = (function () {
                                if (chartPoints.length > 0) {
                                    return [0];
                                }
                                return [0, 0];
                            })();
                            _.forEach(chartPoints, function (chartPoint) {
                                data.push(((chartPoint.understandingPercentage * chartPoint.presentListeners) / 100));
                            });
                            return data;
                        })()
                    }
                ]
            };
        }

        return {
            scope: {
                model: '=statisticChart'
            },
            templateUrl: '/public/app/modules/lecturer/lectureStatistic/statisticChart/statisticChart.html',
            controller: ['$scope', '$element', function ($scope, $element) {

                var data = parseChartModel($scope.model['chartPoints']);
                var canvas = $element.find('canvas')[0];
                var context = canvas.getContext('2d');

                $scope.lineChart = new Chart(context).Line(data, {
                    segmentShowStroke: false,
                    animation: false,
                    tooltipTemplate: "<%=label%>: <%= value %>%",
                    bezierCurve: false
                });
            }]
        };
    }
]);