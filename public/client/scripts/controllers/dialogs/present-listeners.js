"use strict";

angular.module('application')

    .controller('PresentListenersController', [

        '$scope',
        '$modalInstance',
        '$log',
        'apiService',
        'options',

        function ($scope, $modalInstance, $log, apiService, options) {

            var lecture = options.lecture;
            var presentListeners = angular.copy(lecture['presentListeners']);
            var visibleUsers = [];

            var pagination = {
                itemsPerPage: 5,
                maxPaginationSize: 5,
                totalItems: presentListeners.length,
                pageNumber: 1
            };

            function updateDialogTitle() {
                $scope.dialogTitle = 'На лекції присутні ' + presentListeners.length + ' користувач(ів)';
            }

            function updatePage() {
                pagination.totalItems = presentListeners.length;
                if (presentListeners.length > 0) {
                    var users = getUsersForPage();
                    if (!angular.equals(users, visibleUsers)) {
                        visibleUsers = angular.copy(users);
                        apiService.getUsersById(visibleUsers, {
                            success: function (response) {
                                $scope.presentListeners = response.users;
                            }
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
                    for (var index = 0; (index + fromIndex < presentListeners.length) && (index < pagination.itemsPerPage); index++) {
                        users.push(presentListeners[index + fromIndex]);
                    }
                } else {
                    users = presentListeners;
                }

                return users;
            }

            function addUser(userId) {
                if (_.indexOf(presentListeners, userId) == -1) {
                    presentListeners.push(userId);
                    updatePage();
                    updateDialogTitle();
                }
            }

            function removeUser(userId) {
                presentListeners = _.without(presentListeners, userId);

                var pagesCount = Math.ceil(presentListeners.length / pagination.itemsPerPage);
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

            $scope.$on('socketsService:userDisconnected', function (event, data) {
                var userId = data['userId'];
                removeUser(userId);
            });

            $scope.$on('socketsService:listenerJoined', function (event, data) {
                if (data['lectureId'] == lecture.id) {
                    addUser(data['userId']);
                }
            });

            $scope.$on('socketsService:listenerHasLeft', function (event, data) {
                if (data['lectureId'] == lecture.id) {
                    removeUser(data['userId']);
                }
            });

            $scope.$on('socketsService:lectureSuspended', function (event, data) {
                if (data['lectureId'] == lecture.id) {
                    cancel();
                }
            });

            $scope.$on('socketsService:lectureStopped', function (event, data) {
                if (data['lectureId'] == lecture.id) {
                    cancel();
                }
            });

            $scope.cancel = cancel;

            updateDialogTitle();
        }
    ]
);
