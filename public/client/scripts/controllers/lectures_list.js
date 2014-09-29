"use strict";

angular.module('application')

    .controller('LecturesListController', [

        '$scope',
        '$timeout',
        '$interval',
        '$location',
        'apiService',
        'loaderService',
        'socketsService',
        'userService',
        'SOCKET_URL',

        function ($scope, $timeout, $interval, $location, apiService, loaderService, socketsService, userService, SOCKET_URL) {

            function interval(fn, delay, count, invokeApply) {
                fn();
                return $interval(fn, delay, count, invokeApply);
            }

            function findLectureById(lectureId) {
                return _.findWhere($scope.activeLectures, {
                    id: lectureId
                });
            }

            function subscribeForSocketEvent() {

                $scope.$on('socketsService:userDisconnected', function (event, data) {
                    var lectureId = data['lectureId'];
                    if (lectureId) {
                        var lecture = _.findWhere($scope.activeLectures, {
                            id: lectureId
                        });

                        if (lecture) {
                            var userId = data['userId'];
                            $timeout(function () {
                                lecture.presentListeners = _.without(lecture.presentListeners || [], userId);
                            });
                        }
                    }
                });

                $scope.$on('socketsService:lectureStarted', function (event, data) {
                    var lectureId = data['lectureId'];

                    apiService.getLectureById(lectureId, {
                        success: function (response) {

                            var lecture = response.lecture;

                            var activeLectures = $scope.activeLectures;
                            var socketConnection = $scope.socketConnection;

                            lecture.duration = 0;
                            lecture.timer = interval(function () {
                                socketConnection.getLectureDuration(lectureId);
                            }, 1000, 0, false);

                            activeLectures.push(lecture);
                        }
                    });
                });

                $scope.$on('socketsService:lectureResumed', function (event, data) {
                    var lectureId = data['lectureId'];

                    var lecture = findLectureById(lectureId);
                    if (lecture) {
                        lecture.status = 'started';
                        lecture.timer = interval(function () {
                            var socketConnection = $scope.socketConnection;
                            socketConnection.getLectureDuration(lectureId);
                        }, 1000, 0, false);
                    }
                });

                $scope.$on('socketsService:lectureSuspended', function (event, data) {
                    var lectureId = data['lectureId'];

                    var lecture = findLectureById(lectureId);
                    if (lecture) {
                        lecture.status = 'suspended';
                        var timer = lecture.timer;
                        if (timer) {
                            $interval.cancel(timer);
                        }
                    }
                });

                $scope.$on('socketsService:lectureStopped', function (event, data) {
                    var lectureId = data['lectureId'];

                    var lecture = findLectureById(lectureId);
                    if (lecture) {

                        var timer = lecture.timer;
                        if (timer) {
                            $interval.cancel(timer);
                        }

                        $timeout(function () {
                            $scope.activeLectures = _.without($scope.activeLectures, lecture);
                        });
                    }
                });

                $scope.$on('socketsService:updateLectureDuration', function (event, data) {
                    var lectureId = data['lectureId'];

                    var lecture = findLectureById(lectureId);
                    if (lecture) {
                        $timeout(function () {
                            lecture.duration = data['duration'];
                        });
                    }
                });

                $scope.$on('socketsService:updatePresentListeners', function (event, data) {
                    var lectureId = data['lectureId'];

                    var lecture = findLectureById(lectureId);
                    if (lecture) {
                        $timeout(function () {
                            lecture.presentListeners = data['presentListeners'];
                        });
                    }
                });

                $scope.$on('socketsService:listenerJoined', function (event, data) {
                    var lectureId = data['lectureId'];
                    var userId = data['userId'];

                    var lecture = findLectureById(lectureId);
                    if (lecture) {
                        $timeout(function () {
                            var presentListeners = lecture.presentListeners || [];
                            presentListeners.push(userId);
                        });
                    }
                });

                $scope.$on('socketsService:listenerHasLeft', function (event, data) {
                    var lectureId = data['lectureId'];
                    var userId = data['userId'];

                    var lecture = findLectureById(lectureId);
                    if (lecture) {
                        $timeout(function () {
                            var presentListeners = lecture.presentListeners || [];
                            lecture.presentListeners = _.without(presentListeners, userId);
                        });
                    }
                });
            }

            $scope.activeLectures = [];

            $scope.$on('$destroy', function () {
                _.forEach($scope.activeLectures, function (lecture) {
                    var timer = lecture.timer;
                    if (timer) {
                        $interval.cancel(timer);
                    }
                });
            });

            loaderService.showLoader();

            userService.getData({
                success: function (user) {

                    apiService.getActiveLectures({
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

                                $timeout(function () {

                                    $scope.socketConnection = socketConnection;
                                    $scope.activeLectures = response.activeLectures;
                                    $scope.user = user;

                                    _.forEach($scope.activeLectures, function (lecture) {

                                        var id = lecture.id;

                                        switch (lecture.status) {
                                            case 'suspended':
                                            {
                                                lecture.duration = 0;
                                                socketConnection.getLectureDuration(id);
                                                socketConnection.updatePresentListeners(id);
                                                break;
                                            }
                                            case 'started':
                                            {
                                                lecture.duration = 0;
                                                lecture.timer = interval(function () {
                                                    socketConnection.getLectureDuration(id);
                                                    socketConnection.updatePresentListeners(id);
                                                }, 1000, 0, false);
                                                break;
                                            }
                                        }
                                    });

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
