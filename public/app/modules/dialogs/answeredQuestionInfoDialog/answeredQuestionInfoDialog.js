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

            var tabs = [
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
                    templateUrl: '/public/app/modules/dialogs/answeredQuestionInfoDialog/tabs/answeredListenersTab/answeredListenersTab.html',
                    isActive: true
                }
            ];

            function setActiveTab(tab) {
                tab.isActive = true;
                $scope.tab = tab;
            }

            function cancel() {
                $modalInstance.dismiss('cancel');
            }

            $scope.question = options.question;
            $scope.listenerAnswers = options.listenerAnswers;
            $scope.tabs = tabs;
            $scope.tab = _.findWhere(tabs, {
                isActive: true
            });

            $scope.setActiveTab = setActiveTab;
            $scope.cancel = cancel;
        }
    ]
);