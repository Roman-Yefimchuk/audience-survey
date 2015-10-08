"use strict";

angular.module('answerForms.viewableForms.viewableMultiChoiceAnswerForm', [])

    .directive('viewableMultiChoiceAnswerForm', [

        function () {

            return {
                scope: {
                    answerData: '=viewableMultiChoiceAnswerForm',
                    questionData: '='
                },
                templateUrl: '/public/app/modules/answerForms/viewableForms/viewableMultiChoiceAnswerForm/viewableMultiChoiceAnswerForm.html',
                controller: ['$scope', function ($scope) {

                    function isChecked(index) {
                        return _.indexOf($scope.answerData, index) != -1;
                    }

                    $scope.isChecked = isChecked;
                }]
            };
        }
    ]
);
