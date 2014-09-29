"use strict";

angular.module('application')

    .controller('LectureRoomController', [

        '$scope',
        '$rootScope',
        '$location',
        '$routeParams',
        '$timeout',
        '$interval',
        'apiService',
        'loaderService',
        'socketsService',
        'userService',
        'dialogsService',
        'SOCKET_URL',

        function ($scope, $rootScope, $location, $routeParams, $timeout, $interval, apiService, loaderService, socketsService, userService, dialogsService, SOCKET_URL) {

            var lectureId = $routeParams.lectureId;

            function interval(fn, delay, count, invokeApply) {
                fn();
                return $interval(fn, delay, count, invokeApply);
            }

            function subscribeForSocketEvent() {

                $scope.$on('socketsService:userDisconnected', function (event, data) {
                    if (data['lectureId'] == lectureId) {
                        var lecture = $scope.lecture;
                        var userId = data['userId'];
                        $timeout(function () {
                            lecture.presentListeners = _.without(lecture.presentListeners || [], userId);
                        });
                    }
                });

                $scope.$on('socketsService:lectureResumed', function (event, data) {
                    var lecture = $scope.lecture;

                    if (data['lectureId'] == lecture['id']) {
                        lecture.status = 'started';
                        lecture.timer = interval(function () {
                            var socketConnection = $scope.socketConnection;
                            socketConnection.getLectureDuration(lectureId);
                        }, 1000, 0, false);

                        $rootScope.$broadcast('suspendDialog:close');
                    }
                });

                $scope.$on('socketsService:lectureSuspended', function (event, data) {
                    var lecture = $scope.lecture;

                    if (data['lectureId'] == lecture['id']) {
                        lecture.status = 'suspended';
                        var timer = lecture.timer;
                        if (timer) {
                            $interval.cancel(timer);
                        }

                        dialogsService.showSuspendedDialog({
                            leaveCallback: function (closeCallback) {
                                quit();
                                closeCallback();
                            }
                        });
                    }
                });

                $scope.$on('socketsService:lectureStopped', function (event, data) {
                    var lecture = $scope.lecture;
                    if (data['lectureId'] == lecture['id']) {

                        var timer = lecture.timer;
                        if (timer) {
                            $interval.cancel(timer);
                        }

                        $rootScope.$broadcast('suspendDialog:close');
                        dialogsService.showAlert({
                            title: 'Лекція закінчена',
                            message: '' +
                                'Лекція на тему "<b>' + lecture.name + '</b>" закінчена.' +
                                '<br>' +
                                'Дякуємо за увагу.',
                            onClose: function (closeCallback) {
                                $location.path('/lectures-list');
                                closeCallback();
                            }
                        });
                    }
                });

                $scope.$on('socketsService:updateLectureDuration', function (event, data) {
                    var lecture = $scope.lecture;
                    if (data['lectureId'] == lecture.id) {
                        $timeout(function () {
                            lecture.duration = data['duration'];
                        });
                    }
                });

                $scope.$on('socketsService:questionAsked', function (event, data) {
                    var lecture = $scope.lecture;
                    if (data['lectureId'] == lecture.id) {
                        var question = data['question'];
                        dialogsService.showConfirmation({
                            title: 'Як ви вважаєте?..',
                            message: question,
                            onAccept: function (closeCallback) {
                                closeCallback();
                            },
                            onReject: function (closeCallback) {
                                closeCallback();
                            }
                        });
                    }
                });

                $scope.$on('socketsService:updatePresentListeners', function (event, data) {
                    if (data['lectureId'] == lectureId) {
                        var lecture = $scope.lecture;
                        $timeout(function () {
                            lecture.presentListeners = data['presentListeners'];
                        });
                    }
                });

                $scope.$on('socketsService:listenerJoined', function (event, data) {
                    if (data['lectureId'] == lectureId) {
                        var lecture = $scope.lecture;
                        var userId = data['userId'];
                        $timeout(function () {
                            var presentListeners = lecture.presentListeners || [];
                            presentListeners.push(userId);
                        });
                    }
                });

                $scope.$on('socketsService:listenerHasLeft', function (event, data) {
                    if (data['lectureId'] == lectureId) {
                        var lecture = $scope.lecture;
                        var userId = data['userId'];
                        $timeout(function () {
                            var presentListeners = lecture.presentListeners || [];
                            lecture.presentListeners = _.without(presentListeners, userId);
                        });
                    }
                });
            }

            function quit() {
                $location.path('/lectures-list');
            }

            $scope.understandable = 65;
            $scope.notUnderstandable = 35;

            $scope.$on('$destroy', function () {

                var socketConnection = $scope.socketConnection;
                socketConnection.leftFromLecture(lectureId);

                var timer = $scope.lecture['timer'];
                if (timer) {
                    $interval.cancel(timer);
                }

                $rootScope.$broadcast('suspendDialog:close');
            });

            $scope.quit = quit;

            loaderService.showLoader();

            userService.getData({
                success: function (user) {

                    apiService.getLectureById(lectureId, {
                        success: function (response) {

                            $scope.$on('socketsService:error', function (event, error) {
                                $scope.errorMessage = 'Проблема з сокетом';
                                loaderService.hideLoader();
                            });

                            subscribeForSocketEvent();

                            socketsService.openCollection({
                                url: SOCKET_URL,
                                userId: user.userId
                            }, function (socketConnection) {

                                socketConnection.joinToLecture(lectureId);

                                $timeout(function () {

                                    var lecture = response.lecture;

                                    $scope.socketConnection = socketConnection;
                                    $scope.lecture = lecture;
                                    $scope.user = user;

                                    var id = lecture.id;

                                    switch (lecture.status) {
                                        case 'suspended':
                                        {
                                            lecture.duration = 0;

                                            socketConnection.getLectureDuration(id);
                                            socketConnection.updatePresentListeners(id);
                                            dialogsService.showSuspendedDialog({
                                                leaveCallback: function (closeCallback) {
                                                    quit();
                                                    closeCallback();
                                                }
                                            });
                                            break;
                                        }
                                        case 'started':
                                        {
                                            lecture.duration = 0;
                                            lecture.timer = interval(function () {
                                                socketConnection.getLectureDuration(id);
                                            }, 1000, 0, false);

                                            socketConnection.updatePresentListeners(id);
                                            break;
                                        }
                                    }

                                    loaderService.hideLoader();
                                });
                            });
                        }
                    });
                },
                failure: function (error) {
                    $location.path('/');
                    loaderService.hideLoader();
                }
            });
        }
    ]
);
