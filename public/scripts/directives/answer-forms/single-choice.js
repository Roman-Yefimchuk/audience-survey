"use strict";

angular.module('application')

    .directive('singleChoiceAnswer', [

        function () {

            return {
                scope: {
                    data: '='
                },
                templateUrl: '/public/views/directives/answer-forms/single-choice-view.html',
                controller: ['$scope', function ($scope) {
                }]
            };
        }
    ]);