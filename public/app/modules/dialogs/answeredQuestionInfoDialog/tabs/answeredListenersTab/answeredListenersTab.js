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

        function ($q, $scope, usersService) {

            var visibleUsers = [];

            var pagination = {
                itemsPerPage: 5,
                maxPaginationSize: 5,
                totalItems: $scope.listenerAnswers['length'],
                pageNumber: 1
            };

            function updatePage() {

                pagination.totalItems = $scope.listenerAnswers['length'];

                if ($scope.listenerAnswers['length'] > 0) {

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
                                                answerData: _.findWhere($scope.listenerAnswers, {
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

                /*                if (listenerAnswers.length > 0) {
                 var users = getUsersForPage();
                 if (!angular.equals(users, visibleUsers)) {
                 visibleUsers = angular.copy(users);
                 apiService.getUsersById(visibleUsers, {
                 success: function (response) {
                 $scope.answeredListeners = response.users;
                 }
                 });
                 }
                 } else {
                 $scope.answeredListeners = [];
                 visibleUsers = [];
                 }*/
            }

            function getUsersForPage() {

                var users = [];

                if (pagination.totalItems > pagination.itemsPerPage) {

                    var fromIndex = (pagination.pageNumber - 1) * pagination.itemsPerPage;
                    for (var index = 0; (index + fromIndex < $scope.listenerAnswers['length']) && (index < pagination.itemsPerPage); index++) {
                        users.push($scope.listenerAnswers[index + fromIndex].userId);
                    }
                } else {
                    _.forEach($scope.listenerAnswers, function (item) {
                        users.push(item.userId);
                    });
                }

                return users;
            }

            function getListenerAnswer(userId) {
                return _.findWhere($scope.listenerAnswers, {
                    userId: userId
                }).answer;
            }

            $scope.pagination = pagination;
            $scope.usersForPage = [];

            $scope.getListenerAnswer = getListenerAnswer;

            $scope.$watch('pagination.pageNumber', function () {
                updatePage();
            });
        }
    ]
);
