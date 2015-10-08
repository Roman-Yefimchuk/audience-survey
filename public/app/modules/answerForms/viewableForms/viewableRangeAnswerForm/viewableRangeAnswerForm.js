"use strict";

angular.module('answerForms.viewableForms.viewableRangeAnswerForm', [])

    .directive('viewableRangeAnswerForm', [

        function () {

            return {
                scope: {
                    answerData: '=viewableRangeAnswerForm',
                    questionData: '='
                },
                templateUrl: '/public/app/modules/answerForms/viewableForms/viewableRangeAnswerForm/viewableRangeAnswerForm.html',
                controller: ['$scope', function ($scope) {
                }]
            };
        }
    ]
);
