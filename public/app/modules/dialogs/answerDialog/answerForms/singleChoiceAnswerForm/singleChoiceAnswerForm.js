"use strict";

angular.module('dialogs.answerDialog.answerForms.singleChoiceAnswerForm', [])

    .directive('singleChoiceAnswerForm', [

        function () {

            return {
                scope: {
                    data: '=singleChoiceAnswerForm',
                    options: '='
                },
                templateUrl: '/public/app/modules/dialogs/answerDialog/answerForms/singleChoiceAnswerForm/singleChoiceAnswerForm.html',
                controller: ['$scope', function ($scope) {

                    $scope.items = $scope.data;
                    $scope.chosenItem = {
                        index: -1
                    };

                    $scope.$watch('chosenItem', function (chosenItem) {

                        if (chosenItem.index != -1) {
                            $scope.options['canSendAnswer'] = true;
                            $scope.options['answerData'] = chosenItem.index;
                        }
                    }, true);
                }]
            };
        }
    ]
);
