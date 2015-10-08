"use strict";

angular.module('dialogs.answeredQuestionInfoDialog.tabs.answerStatisticTab', [])

    .controller('AnswerStatisticTabController', [

        '$scope',

        function ($scope) {

            var calculateStatistic = {
                'default': function (answerData) {
                },
                'multi-choice': function (answerData) {
                },
                'range': function (answerData) {
                },
                'single-choice': function (answerData) {
                }
            };
        }
    ]
);
