"use strict";

angular.module('answerForms.editableForms.editableDefaultAnswerForm', [])

    .directive('editableDefaultAnswerForm', [

        function () {

            return {
                scope: {
                    data: '=editableDefaultAnswerForm',
                    options: '='
                },
                templateUrl: '/public/app/modules/answerForms/editableForms/editableDefaultAnswerForm/editableDefaultAnswerForm.html',
                controller: ['$scope', function ($scope) {

                    $scope.answer = null;

                    $scope.$watch('answer', function (answer) {

                        if (typeof answer == 'boolean') {

                            $scope.options['isAnswerChosen'] = true;
                            $scope.options['answerData'] = answer ? 'yes' : 'no';
                        }
                    });
                }]
            };
        }
    ]
);
