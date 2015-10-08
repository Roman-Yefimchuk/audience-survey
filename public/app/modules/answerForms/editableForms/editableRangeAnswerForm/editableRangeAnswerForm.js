"use strict";

angular.module('answerForms.editableForms.editableRangeAnswerForm', [])

    .directive('editableRangeAnswerForm', [

        function () {

            return {
                scope: {
                    data: '=editableRangeAnswerForm',
                    options: '='
                },
                templateUrl: '/public/app/modules/answerForms/editableForms/editableRangeAnswerForm/editableRangeAnswerForm.html',
                controller: ['$scope', function ($scope) {

                    $scope.range = parseInt(($scope.data['maxValue'] - $scope.data['minValue']) / 2) + $scope.data['minValue'];

                    $scope.$watch('range', function (range) {
                        $scope.options['answerData'] = range;
                    });

                    $scope.options['isAnswerChosen'] = true;
                }]
            };
        }
    ]
);
