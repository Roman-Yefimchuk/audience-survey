"use strict";

angular.module('application')

    .directive('defaultAnswer', [

        function () {

            return {
                scope: {
                    data: '='
                },
                templateUrl: '/public/views/directives/answer-forms/default-view.html',
                controller: ['$scope', function ($scope) {
                }]
            };
        }
    ]);