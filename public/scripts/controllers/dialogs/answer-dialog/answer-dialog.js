"use strict";

angular.module('application')

    .controller('AnswerDialogController', [

        '$scope',
        '$modalInstance',
        'options',

        function ($scope, $modalInstance, options) {

            var question = options.question;
            var onSendAnswer = options.onSendAnswer;

            var answerForms = {
                'default': {
                    'templateUrl': '/public/views/controllers/dialogs/answer-dialog/answer-forms/default/substrate-view.html'
                },
                'single-choice': {
                    'templateUrl': '/public/views/controllers/dialogs/answer-dialog/answer-forms/single-choice/substrate-view.html'
                },
                'multi-choice': {
                    'templateUrl': '/public/views/controllers/dialogs/answer-dialog/answer-forms/multi-choice/substrate-view.html'
                },
                'range': {
                    'templateUrl': '/public/views/controllers/dialogs/answer-dialog/answer-forms/range/substrate-view.html'
                }
            };

            function getSubstrateView() {
                return answerForms[question.type].templateUrl;
            }

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

            $scope.getSubstrateView = getSubstrateView;
            $scope.sendAnswer = sendAnswer;
            $scope.close = close;
        }
    ]
);
