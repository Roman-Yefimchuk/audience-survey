"use strict";

angular.module('application')

    .directive('surveyDonut', [

        function () {
            return {
                scope: {
                    donutModel: '='
                },
                templateUrl: '/client/views/directives/survey-donut-view.html',
                controller: ['$scope', function ($scope) {

                    var donut = new Morris.Donut({
                        element: 'graph',
                        data: $scope.donutModel,
                        labelColor: '#797979',
                        colors: [
                            '#4cae4c',
                            '#d43f3a'
                        ],
                        formatter: function (value) {
                            return value + "%"
                        }
                    });

                    $scope.$watch('donutModel', function (donutModel) {
                        donut.setData(donutModel);
                    }, true);
                }]
            };
        }
    ]);