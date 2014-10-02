"use strict";

angular.module('application')

    .directive('lectureStatistic', [

        '$rootScope',

        function ($rootScope) {
            return {
                scope: {
                    statisticModel: '=',
                    graphId: '@'
                },
                controller: ['$scope', function ($scope) {

                    var unwatch = $scope.$watch('graphId', function (graphId) {

                        var linearGraph = new Morris.Line({
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
                        });

                        $rootScope.$broadcast('statisticGraph:ready');

                        unwatch();
                    });
                }]
            };
        }
    ]);