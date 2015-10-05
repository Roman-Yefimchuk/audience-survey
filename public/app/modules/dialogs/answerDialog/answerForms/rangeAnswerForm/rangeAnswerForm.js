"use strict";

angular.module('dialogs.answerDialog.answerForms.rangeAnswerForm', [])

    .directive('rangeAnswerForm', [

        function () {

            return {
                scope: {
                    data: '=rangeAnswerForm',
                    options: '='
                },
                templateUrl: '/public/app/modules/dialogs/answerDialog/answerForms/rangeAnswerForm/rangeAnswerForm.html',
                controller: ['$scope', function ($scope) {

                    $scope.range = parseInt(($scope.data['maxValue'] - $scope.data['minValue']) / 2) + $scope.data['minValue'];

                    $scope.$watch('range', function (range) {
                        $scope.options['answerData'] = range;
                    });

                    $scope.options['canSendAnswer'] = true;
                }]
            };
        }
    ]
);
