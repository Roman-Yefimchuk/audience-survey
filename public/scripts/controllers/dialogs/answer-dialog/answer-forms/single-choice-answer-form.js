"use strict";

angular.module('application')

    .controller('SingleChoiceAnswerFormController', [

        '$scope',

        function ($scope) {

            $scope.items = $scope.question['data'];
            $scope.chosenItem = {
                index: -1
            };

            $scope.$watch('chosenItem', function (chosenItem) {

                if (chosenItem.index != -1) {
                    $scope.options['canSendAnswer'] = true;
                    $scope.options['answerData'] = chosenItem.index;
                }
            }, true);
        }
    ]
);
