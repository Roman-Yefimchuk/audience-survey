"use strict";

angular.module('answerForms.viewableForms.viewableSingleChoiceAnswerForm', [])

    .directive('viewableSingleChoiceAnswerForm', [

        function () {

            return {
                scope: {
                    answerData: '=viewableSingleChoiceAnswerForm',
                    questionData: '='
                },
                templateUrl: '/public/app/modules/answerForms/viewableForms/viewableSingleChoiceAnswerForm/viewableSingleChoiceAnswerForm.html',
                controller: ['$scope', function ($scope) {
                }]
            };
        }
    ]
);
