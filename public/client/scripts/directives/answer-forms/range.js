"use strict";

angular.module('application')

    .directive('rangeAnswer', [

        function () {

            return {
                scope: {
                    data: '='
                },
                templateUrl:'/client/views/directives/answer-forms/range-view.html',
                controller: ['$scope', function ($scope) {
                }]
            };
        }
    ]);