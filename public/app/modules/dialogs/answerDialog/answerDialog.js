"use strict";

angular.module('dialogs.answerDialog', [

    'dialogs.answerDialog.answerForms.defaultAnswerForm',
    'dialogs.answerDialog.answerForms.multiChoiceAnswerForm',
    'dialogs.answerDialog.answerForms.rangeAnswerForm',
    'dialogs.answerDialog.answerForms.singleChoiceAnswerForm'

]).controller('AnswerDialogController', [

        '$scope',
        '$modalInstance',
        'options',

        function ($scope, $modalInstance, options) {

            var question = options.question;
            var onSendAnswer = options.onSendAnswer;

            function sendAnswer() {
                onSendAnswer($scope.options['answerData'], function () {
                    $modalInstance.close();
                });
            }

            function close() {
                $modalInstance.dismiss('cancel');
            }

            $scope.question = question;
            $scope.options = {
                canSendAnswer: false,
                answerData: null
            };

            $scope.sendAnswer = sendAnswer;
            $scope.close = close;
        }
    ]
);
