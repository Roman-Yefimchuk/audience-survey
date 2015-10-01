"use strict";

angular.module('application')

    .directive('rangeAnswer', [

        function () {

            return {
                scope: {
                    data: '='
                },
                templateUrl:'/public/views/directives/answer-forms/range-view.html',
                controller: ['$scope', function ($scope) {
                }]
            };
        }
    ]);