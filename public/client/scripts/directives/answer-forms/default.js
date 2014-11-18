"use strict";

angular.module('application')

    .directive('defaultAnswer', [

        function () {

            return {
                scope: {
                    data: '='
                },
                templateUrl: '/client/views/directives/answer-forms/default-view.html',
                controller: ['$scope', function ($scope) {
                }]
            };
        }
    ]);