"use strict";

angular.module('dialogs.presentListeners', [])

    .controller('PresentListenersController', [

        '$q',
        '$scope',
        '$timeout',
        '$modalInstance',
        'usersService',
        'socketEventsManagerService',
        'listeners',
        'socketConnection',

        function ($q, $scope, $timeout, $modalInstance, usersService, socketEventsManagerService, listeners, socketConnection) {

            var visibleUsers = [];

            var pagination = {
                itemsPerPage: 5,
                maxPaginationSize: 5,
                totalItems: listeners.length,
                pageNumber: 1
            };

            function updateDialogTitle() {
                $scope.dialogTitle = 'На лекції присутні ' + listeners.length + ' користувач(ів)';
            }

            function updatePage() {

                pagination.totalItems = listeners.length;

                if (listeners.length > 0) {

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
                                                name: user.name
                                            });
                                        }, function (e) {
                                            reject(e);
                                        });
                                }));
                            });
                            return requests;
                        })()).then(function (users) {
                            $scope.presentListeners = users;
                        });
                    }
                } else {
                    $scope.presentListeners = [];
                    visibleUsers = [];
                }
            }

            function getUsersForPage() {

                var users = [];

                if (pagination.totalItems > pagination.itemsPerPage) {

                    var fromIndex = (pagination.pageNumber - 1) * pagination.itemsPerPage;
                    for (var index = 0; (index + fromIndex < listeners.length) && (index < pagination.itemsPerPage); index++) {
                        users.push(listeners[index + fromIndex]);
                    }
                } else {
                    users = listeners;
                }

                return users;
            }

            function listenerJoined(userId) {

                if (_.indexOf(listeners, userId) == -1) {

                    listeners.push(userId);
                    updatePage();
                    updateDialogTitle();
                }
            }

            function listenerWent(userId) {

                listeners = _.without(listeners, userId);

                var pagesCount = Math.ceil(listeners.length / pagination.itemsPerPage);
                if (pagination.pageNumber > pagesCount) {
                    pagination.pageNumber--;
                } else {
                    updatePage();
                }

                updateDialogTitle();
            }

            function cancel() {
                $modalInstance.dismiss('cancel');
            }

            $scope.pagination = pagination;
            $scope.usersForPage = [];

            $scope.$watch('pagination.pageNumber', function () {
                updatePage();
            });

            $scope.cancel = cancel;

            updateDialogTitle();

            socketEventsManagerService.subscribe($scope, [
                socketConnection.on('on_listener_joined', function (data) {

                    var userId = data.userId;

                    $timeout(function () {
                        listenerJoined(userId);
                    });
                }),
                socketConnection.on('on_listener_went', function (data) {

                    var userId = data.userId;

                    $timeout(function () {
                        listenerWent(userId);
                    });
                }),
                socketConnection.on('on_lecture_suspended', function () {
                    cancel();
                }),
                socketConnection.on('on_lecture_stopped', function () {
                    cancel();
                })
            ]);
        }
    ]
);
