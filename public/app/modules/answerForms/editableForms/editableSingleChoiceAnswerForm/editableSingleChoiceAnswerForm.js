"use strict";

angular.module('answerForms.editableForms.editableSingleChoiceAnswerForm', [])

    .directive('editableSingleChoiceAnswerForm', [

        function () {

            return {
                scope: {
                    data: '=editableSingleChoiceAnswerForm',
                    options: '='
                },
                templateUrl: '/public/app/modules/answerForms/editableForms/editableSingleChoiceAnswerForm/editableSingleChoiceAnswerForm.html',
                controller: ['$scope', function ($scope) {

                    $scope.items = $scope.data;
                    $scope.chosenItem = {
                        index: -1
                    };

                    $scope.$watch('chosenItem', function (chosenItem) {

                        if (chosenItem.index != -1) {
                            $scope.options['isAnswerChosen'] = true;
                            $scope.options['answerData'] = chosenItem.index;
                        }
                    }, true);
                }]
            };
        }
    ]
);
