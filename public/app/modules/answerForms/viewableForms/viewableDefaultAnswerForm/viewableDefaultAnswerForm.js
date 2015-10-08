"use strict";

angular.module('answerForms.viewableForms.viewableDefaultAnswerForm', [])

    .directive('viewableDefaultAnswerForm', [

        function () {

            return {
                scope: {
                    answerData: '=viewableDefaultAnswerForm',
                    questionData: '='
                },
                templateUrl: '/public/app/modules/answerForms/viewableForms/viewableDefaultAnswerForm/viewableDefaultAnswerForm.html',
                controller: ['$scope', function ($scope) {
                }]
            };
        }
    ]
);
