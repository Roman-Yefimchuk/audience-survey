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

                        _.forEach($scope.chartPoints, function (chartPoint) {
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
                        });

                        /*                        Morris.Area({
                         element: angular.element('[graph-id=' + graphId + ']'),
                         data: [{
                         period: '2010 Q1',
                         iphone: 2666,
                         ipad: null,
                         itouch: 2647
                         }, {
                         period: '2010 Q2',
                         iphone: 2778,
                         ipad: 2294,
                         itouch: 2441
                         }, {
                         period: '2010 Q3',
                         iphone: 4912,
                         ipad: 1969,
                         itouch: 2501
                         }, {
                         period: '2010 Q4',
                         iphone: 3767,
                         ipad: 3597,
                         itouch: 5689
                         }, {
                         period: '2011 Q1',
                         iphone: 6810,
                         ipad: 1914,
                         itouch: 2293
                         }, {
                         period: '2011 Q2',
                         iphone: 5670,
                         ipad: 4293,
                         itouch: 1881
                         }, {
                         period: '2011 Q3',
                         iphone: 4820,
                         ipad: 3795,
                         itouch: 1588
                         }, {
                         period: '2011 Q4',
                         iphone: 15073,
                         ipad: 5967,
                         itouch: 5175
                         }, {
                         period: '2012 Q1',
                         iphone: 10687,
                         ipad: 4460,
                         itouch: 2028
                         }, {
                         period: '2012 Q2',
                         iphone: 8432,
                         ipad: 5713,
                         itouch: 1791
                         }],
                         xkey: 'period',
                         ykeys: ['iphone', 'ipad', 'itouch'],
                         labels: ['Кількість слухачів', 'Розуміють', 'Не розуміють'],
                         pointSize: 2,
                         hideHover: 'auto',
                         resize: true
                         });*/

                        /*                        var linearGraph = new Morris.Line({
                         element: angular.element('[graph-id=' + graphId + ']'),
                         data: $scope.statisticModel,
                         xkey: 'year',
                         ykeys: ['value'],
                         labels: ['Value'],
                         pointSize: 3,
                         hideHover: 'auto',
                         resize: true,
                         xLabelFormat: function (x) {
                         return x.getFullYear();
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