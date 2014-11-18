"use strict";

angular.module('application')

    .directive('multiChoiceAnswer', [

        function () {

            return {
                scope: {
                    data: '='
                },
                templateUrl:'/client/views/directives/answer-forms/multi-choice-view.html',
                controller: ['$scope', function ($scope) {
                }]
            };
        }
    ]);