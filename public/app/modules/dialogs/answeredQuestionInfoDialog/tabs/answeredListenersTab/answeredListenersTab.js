"use strict";

angular.module('dialogs.answeredQuestionInfoDialog.tabs.answeredListenersTab', [

    'answerForms.viewableForms.viewableDefaultAnswerForm',
    'answerForms.viewableForms.viewableMultiChoiceAnswerForm',
    'answerForms.viewableForms.viewableRangeAnswerForm',
    'answerForms.viewableForms.viewableSingleChoiceAnswerForm'

]).controller('AnsweredListenersTabController', [

        '$q',
        '$scope',
        'usersService',
        'question',
        'listenerAnswers',

        function ($q, $scope, usersService, question, listenerAnswers) {

            var visibleUsers = [];

            var pagination = {
                itemsPerPage: 5,
                maxPaginationSize: 5,
                totalItems: listenerAnswers.length,
                pageNumber: 1
            };

            function updatePage() {

                pagination.totalItems = listenerAnswers.length;

                if (listenerAnswers.length > 0) {

                    var users = getUsersForPage();

                    if (!angular.equals(users, visibleUsers)) {

                        visibleUsers = angular.copy(users);

                        $q.all((function () {

                            var requests = [];

                            _.forEach(visibleUsers, function (userId) {

                                requests.push($q(function (resolve, reject) {
                                    usersService.getUserName(userId)
                                        .then(function (user) {
                                            resolve({
                                                id: userId,
                                                name: user.name,
                                                answerData: _.findWhere(listenerAnswers, {
                                                    userId: userId
                                                }).answerData
                                            });
                                        }, function (e) {
                                            reject(e);
                                        });
                                }));
                            });
                            return requests;
                        })()).then(function (users) {
                            $scope.answeredListeners = users;
                        });
                    }
                } else {
                    $scope.answeredListeners = [];
                    visibleUsers = [];
                }
            }

            function getUsersForPage() {

                var users = [];

                if (pagination.totalItems > pagination.itemsPerPage) {

                    var fromIndex = (pagination.pageNumber - 1) * pagination.itemsPerPage;
                    for (var index = 0; (index + fromIndex < listenerAnswers.length) && (index < pagination.itemsPerPage); index++) {
                        users.push(listenerAnswers[index + fromIndex].userId);
                    }
                } else {
                    _.forEach(listenerAnswers, function (item) {
                        users.push(item.userId);
                    });
                }

                return users;
            }

            function getListenerAnswer(userId) {
                return _.findWhere(listenerAnswers, {
                    userId: userId
                }).answer;
            }

            $scope.pagination = pagination;
            $scope.usersForPage = [];
            $scope.question = question;
            $scope.listenerAnswers = listenerAnswers;

            $scope.getListenerAnswer = getListenerAnswer;

            $scope.$watch('pagination.pageNumber', function () {
                updatePage();
            });
        }
    ]
);
