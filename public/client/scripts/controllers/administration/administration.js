"use strict";

angular.module('application')

    .controller('AdministrationController', [

        '$scope',
        '$interval',
        '$timeout',
        '$location',
        'apiService',
        'userService',
        'loaderService',
        'dialogsService',
        'socketsService',
        'SOCKET_URL',

        function ($scope, $interval, $timeout, $location, apiService, userService, loaderService, dialogsService, socketsService, SOCKET_URL) {

            function interval(fn, delay, count, invokeApply) {
                fn();
                return $interval(fn, delay, count, invokeApply);
            }

            function findLectureById(lectureId) {
                return _.findWhere($scope.lectures, {
                    id: lectureId
                });
            }

            function showPresentListeners(lecture) {
                dialogsService.showPresentListeners({
                    lecture: lecture
                });
            }

            function addLecture() {
                var lectures = $scope.lectures;

                var lectureName = $scope['newLecture'].trim();
                if (lectureName) {
                    apiService.createLecture({
                        name: lectureName,
                        authorId: $scope.user['userId']
                    }, {
                        success: function (response) {
                            lectures.push({
                                id: response.lectureId,
                                name: lectureName,
                                author: $scope.user['name'],
                                statisticCharts: [],
                                status: 'stopped'
                            });
                            $scope.newLecture = '';
                        }
                    });
                }
            }

            function editLecture(lecture) {
                dialogsService.showItemEditor({
                    dialogTitle: 'Редагувати назву лекції',
                    itemTitle: lecture.name,
                    onUpdate: function (name, closeCallback) {
                        apiService.updateLecture(lecture.id, {
                            name: name
                        }, {
                            success: function () {
                                lecture.name = name;
                                closeCallback();
                            }
                        });
                    }
                });
            }

            function removeLecture(lecture) {
                apiService.removeLecture(lecture.id, {
                    success: function () {
                        $scope.lectures = _.without($scope.lectures, lecture);
                    }
                });
            }

            function clearInput() {
                $scope.newLecture = '';
            }

            function startLecture(lecture) {
                var socketConnection = $scope.socketConnection;
                socketConnection.startLecture(lecture.id);
            }

            function resumeLecture(lecture) {
                var socketConnection = $scope.socketConnection;
                socketConnection.resumeLecture(lecture.id);
            }

            function suspendLecture(lecture) {
                var socketConnection = $scope.socketConnection;
                socketConnection.suspendLecture(lecture.id);
            }

            function stopLecture(lecture) {
                var socketConnection = $scope.socketConnection;
                socketConnection.stopLecture(lecture.id);
            }

            function subscribeForSocketEvent() {

                $scope.$on('socketsService:userDisconnected', function (event, data) {
                    var lectureId = data['lectureId'];
                    if (lectureId) {
                        var lecture = _.findWhere($scope.lectures, {
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
                    var lecture = findLectureById(lectureId);
                    if (lecture) {
                        var socketConnection = $scope.socketConnection;

                        lecture.status = 'started';
                        lecture.duration = 0;
                        lecture.timer = interval(function () {
                            socketConnection.getLectureDuration(lectureId);
                        }, 1000, 0, false);
                    }
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
                        lecture.status = 'stopped';
                        var timer = lecture.timer;
                        if (timer) {
                            $interval.cancel(timer);
                        }
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

                $scope.$on('socketsService:updateTotalLectureDuration', function (event, data) {
                    var lectureId = data['lectureId'];
                    var lecture = findLectureById(lectureId);
                    if (lecture) {
                        $timeout(function () {
                            lecture.totalDuration = data['totalDuration'];
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

            $scope.newLecture = '';
            $scope.lectures = [];
            $scope.loading = false;

            $scope.$on('$destroy', function () {
                _.forEach($scope.lectures, function (lecture) {
                    var timer = lecture.timer;
                    if (timer) {
                        $interval.cancel(timer);
                    }
                });
            });

            $scope.startLecture = startLecture;
            $scope.resumeLecture = resumeLecture;
            $scope.suspendLecture = suspendLecture;
            $scope.stopLecture = stopLecture;

            $scope.addLecture = addLecture;
            $scope.editLecture = editLecture;
            $scope.removeLecture = removeLecture;
            $scope.clearInput = clearInput;

            $scope.showPresentListeners = showPresentListeners;

            loaderService.showLoader();

            userService.getData({
                success: function (user) {

                    apiService.getLecturesByAuthorId(user.userId, {
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
                                    $scope.lectures = response.lectures;
                                    $scope.user = user;

                                    _.forEach($scope.lectures, function (lecture) {

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
