"use strict";

angular.module('dialogs.answerDialog', [

    'filters.formatSeconds',
    'answerForms.editableForms.editableDefaultAnswerForm',
    'answerForms.editableForms.editableMultiChoiceAnswerForm',
    'answerForms.editableForms.editableRangeAnswerForm',
    'answerForms.editableForms.editableSingleChoiceAnswerForm'

]).controller('AnswerDialogController', [

        '$scope',
        '$timeout',
        '$modalInstance',
        'options',

        function ($scope, $timeout, $modalInstance, options) {

            var question = options.question;
            var onSendAnswer = options.onSendAnswer;
            var autoCloseTimeout = options.autoCloseTimeout;

            function sendAnswer() {
                onSendAnswer($scope.options['answerData'], function () {
                    $modalInstance.close();
                });
            }

            function close() {

                var autoCloseTimer = $scope.autoCloseTimer;
                if (autoCloseTimer) {
                    autoCloseTimer.stop();
                }

                $modalInstance.dismiss('cancel');
            }

            $scope.autoCloseTimer = (function (autoCloseTimeout) {

                if (autoCloseTimeout > 0) {

                    return new Timer(function () {

                        if (this.count < autoCloseTimeout - 1) {

                            $timeout(_.bind(function () {
                                this.count++;
                            }, this));
                        } else {
                            close();
                        }
                    }, 1000).start(function () {

                            $timeout(_.bind(function () {

                                this.count = 0;
                                this.autoCloseTimeout = autoCloseTimeout;
                            }, this));
                        });
                }
            })(options.autoCloseTimeout || 0);
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
