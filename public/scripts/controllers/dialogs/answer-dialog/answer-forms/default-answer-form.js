"use strict";

angular.module('application')

    .controller('DefaultAnswerFormController', [

        '$scope',

        function ($scope) {

            $scope.data = $scope.question['data'];
            $scope.answer = null;

            $scope.$watch('answer', function (answer) {

                if (typeof answer == 'boolean') {

                    $scope.options['canSendAnswer'] = true;
                    $scope.options['answerData'] = answer ? 'yes' : 'no';
                }
            });
        }
    ]
);
