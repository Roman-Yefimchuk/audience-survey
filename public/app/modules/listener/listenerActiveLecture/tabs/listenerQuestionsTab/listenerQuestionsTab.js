"use strict";

angular.module('listener.listenerActiveLecture.tabs.listenerQuestionsTab', [

    'services.dialogsService'

]).controller('ListenerQuestionTabController', [

        '$scope',
        'savedState',
        'dialogsService',
        'socketConnection',
        'askedQuestionsManager',

        function ($scope, savedState, dialogsService, socketConnection, askedQuestionsManager) {

            function sendAnswer(askedQuestion) {

                dialogsService.showAnswerDialog({
                    question: {
                        text: askedQuestion.text,
                        type: askedQuestion.type,
                        data: askedQuestion.data
                    },
                    onSendAnswer: function (answerData, closeCallback) {

                        socketConnection.emit('send_answer', {
                            questionId: askedQuestion.id,
                            answerData: answerData
                        });

                        askedQuestion.answerData = answerData;
                        closeCallback();
                    }
                });
            }

            function showAnswerInfo(askedQuestion) {
                dialogsService.showListenerAnswerInfoDialog(askedQuestion);
            }

            function getAskedQuestions() {
                return askedQuestionsManager.getAskedQuestions();
            }

            $scope.sendAnswer = sendAnswer;
            $scope.showAnswerInfo = showAnswerInfo;
            $scope.getAskedQuestions = getAskedQuestions;
        }
    ]
);
