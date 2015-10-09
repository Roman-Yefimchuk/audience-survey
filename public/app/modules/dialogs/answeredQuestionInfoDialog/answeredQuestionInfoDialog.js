"use strict";

angular.module('dialogs.answeredQuestionInfoDialog', [

    'dialogs.answeredQuestionInfoDialog.tabs.answeredListenersTab',
    'dialogs.answeredQuestionInfoDialog.tabs.answerStatisticTab'

]).controller('AnsweredQuestionInfoDialogController', [

        '$q',
        '$scope',
        '$modalInstance',
        'usersService',
        'options',

        function ($q, $scope, $modalInstance, usersService, options) {

            function cancel() {
                $modalInstance.dismiss('cancel');
            }

            $scope.tabs = [
                /*                {
                 id: 'answerStatistic',
                 title: 'Статистика',
                 icon: 'fa-line-chart',
                 templateUrl: '/public/app/modules/dialogs/answeredQuestionInfoDialog/tabs/answerStatisticTab/answerStatisticTab.html',
                 isActive: true
                 },*/
                {
                    id: 'answeredListeners',
                    title: 'Опитування',
                    icon: 'fa-users',
                    isActive: true,
                    controller: 'AnsweredListenersTabController',
                    templateUrl: '/public/app/modules/dialogs/answeredQuestionInfoDialog/tabs/answeredListenersTab/answeredListenersTab.html',
                    resolve: {
                        question: options.question,
                        listenerAnswers: options.listenerAnswers
                    }
                }
            ];

            $scope.cancel = cancel;
        }
    ]
);
