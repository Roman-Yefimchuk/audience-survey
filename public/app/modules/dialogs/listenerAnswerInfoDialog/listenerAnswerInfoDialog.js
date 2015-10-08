"use strict";

angular.module('dialogs.listenerAnswerInfoDialog', [

    'answerForms.viewableForms.viewableDefaultAnswerForm',
    'answerForms.viewableForms.viewableMultiChoiceAnswerForm',
    'answerForms.viewableForms.viewableRangeAnswerForm',
    'answerForms.viewableForms.viewableSingleChoiceAnswerForm'

]).controller('ListenerAnswerInfoDialogController', [

        '$scope',
        '$modalInstance',
        'askedQuestion',

        function ($scope, $modalInstance, askedQuestion) {

            function close() {
                $modalInstance.close();
            }

            $scope.answerData = askedQuestion.answerData;
            $scope.question = {
                text: askedQuestion.text,
                type: askedQuestion.type,
                data: askedQuestion.data
            };

            $scope.close = close;
        }
    ]
);
