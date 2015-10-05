"use strict";

angular.module('dialogs.answerDialog.answerForms.defaultAnswerForm', [])

    .directive('defaultAnswerForm', [

        function () {

            return {
                scope: {
                    data: '=defaultAnswerForm',
                    options: '='
                },
                templateUrl: '/public/app/modules/dialogs/answerDialog/answerForms/defaultAnswerForm/defaultAnswerForm.html',
                controller: ['$scope', function ($scope) {

                    $scope.answer = null;

                    $scope.$watch('answer', function (answer) {

                        if (typeof answer == 'boolean') {

                            $scope.options['canSendAnswer'] = true;
                            $scope.options['answerData'] = answer ? 'yes' : 'no';
                        }
                    });
                }]
            };
        }
    ]
);
