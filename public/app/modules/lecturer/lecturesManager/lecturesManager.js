"use strict";

angular.module('lecturer.lecturesManager', [

    'filters.formatTime',
    'genericHeader',
    'services.dialogsService',
    'services.socketEventsManagerService',
    'services.api.lecturesService',
    'services.api.activeLecturesService'

]).controller('LecturesManagerController', [

        '$scope',
        '$timeout',
        '$location',
        'dialogsService',
        'socketEventsManagerService',
        'lecturesService',
        'activeLecturesService',
        'user',
        'lectures',
        'activeLectures',
        'socketConnection',

        function ($scope, $timeout, $location, dialogsService, socketEventsManagerService, lecturesService, activeLecturesService, user, lectures, activeLectures, socketConnection) {

            var userId = user.id;

            function showPresentListeners(lecture) {

                var activeLecture = getActiveLecture(lecture.id);
                if (activeLecture) {
                    dialogsService.showPresentListeners(activeLecture.listeners, socketConnection);
                }
            }

            function addLecture() {
                var lectures = $scope.lectures;

                var lectureName = $scope['newLectureName'].trim();
                if (lectureName) {

                    lecturesService.createLecture(user.id, {
                        name: lectureName
                    }).then(function (lecture) {

                        lectures.push({
                            id: lecture.id,
                            name: lectureName,
                            creationDate: lecture.creationDate,
                            lecturer: (function () {
                                return {
                                    id: user.id,
                                    rating: user.rating,
                                    profile: (function (profile) {
                                        return {
                                            name: profile.name,
                                            email: profile.email
                                        };
                                    })(user.profile)
                                };
                            })(),
                            description: ''
                        });
                    });
                }
            }

            function editLecture(lecture) {

                dialogsService.showLectureEditor({
                    name: lecture.name,
                    description: lecture.description,
                    links: lecture.links,
                    onSave: function (model, closeCallback) {

                        lecturesService.updateLecture(user.id, lecture.id, {
                            name: model.name,
                            description: model.description,
                            links: model.links
                        }).then(function () {

                            lecture.name = model.name;
                            lecture.description = model.description;
                            lecture.links = model.links;

                            closeCallback();
                        });
                    }
                });
            }

            function removeLecture(lecture) {

                dialogsService.showConfirmation({
                    title: 'Видалити лекцію',
                    message: 'Ви дійсно хочете видалити лекцію <b>{{ lecture.name }}</b>?',
                    context: {
                        lecture: lecture
                    },
                    onAccept: function (closeCallback) {
                        lecturesService.removeLecture(user.id, lecture.id)
                            .then(function () {
                                $scope.lectures = _.without($scope.lectures, lecture);
                                closeCallback();
                            });
                    }
                });
            }

            function startLecture(lecture) {
                activeLecturesService.startLecture(userId, lecture.id)
                    .then(function () {
                        $timeout(function () {
                            $location.path('/lecturers/' + user.id + '/activeLectures/' + lecture.id);
                        });
                    });
            }

            function suspendLecture(lecture) {
                activeLecturesService.suspendLecture(userId, lecture.id)
                    .then(function () {
                        $timeout(function () {
                            var activeLecture = getActiveLecture(lecture.id);
                            if (activeLecture) {
                                activeLecture.status = 'suspended';
                            }
                        });
                    });
            }

            function resumeLecture(lecture) {
                activeLecturesService.resumeLecture(userId, lecture.id)
                    .then(function () {
                        $timeout(function () {
                            var activeLecture = getActiveLecture(lecture.id);
                            if (activeLecture) {
                                activeLecture.status = 'started';
                            }
                        });
                    });
            }

            function stopLecture(lecture) {
                activeLecturesService.stopLecture(userId, lecture.id)
                    .then(function () {
                        $timeout(function () {
                            var activeLecture = getActiveLecture(lecture.id);
                            if (activeLecture) {
                                $scope.activeLectures = _.without($scope.activeLectures, activeLecture);
                            }
                        });
                    });
            }

            function clearInput() {
                $scope.newLectureName = '';
            }

            function getActiveLecture(lectureId) {
                return _.findWhere($scope.activeLectures, {
                    id: lectureId
                });
            }

            $scope.newLectureName = '';
            $scope.user = user;
            $scope.lectures = lectures;
            $scope.activeLectures = activeLectures;

            $scope.showPresentListeners = showPresentListeners;

            $scope.addLecture = addLecture;
            $scope.editLecture = editLecture;
            $scope.removeLecture = removeLecture;

            $scope.startLecture = startLecture;
            $scope.suspendLecture = suspendLecture;
            $scope.resumeLecture = resumeLecture;
            $scope.stopLecture = stopLecture;

            $scope.clearInput = clearInput;

            $scope.getActiveLecture = getActiveLecture;

            socketEventsManagerService.subscribe($scope, [
                socketConnection.on('on_listener_joined', function (data) {

                    var lectureId = data.lectureId;
                    var userId = data.userId;

                    $timeout(function () {

                        var activeLecture = getActiveLecture(lectureId);
                        if (activeLecture) {

                            var listeners = activeLecture.listeners;

                            if (_.indexOf(listeners, userId) == -1) {
                                listeners.push(userId);
                            }
                        }
                    });
                }),
                socketConnection.on('on_listener_went', function (data) {

                    var lectureId = data.lectureId;
                    var userId = data.userId;

                    $timeout(function () {

                        var activeLecture = getActiveLecture(lectureId);
                        if (activeLecture) {
                            activeLecture.listeners = _.without(activeLecture.listeners, userId);
                        }
                    });
                }),
                socketConnection.on('on_lecture_duration_changed', function (data) {

                    var lectureId = data.lectureId;
                    var duration = data.duration;

                    var activeLecture = getActiveLecture(lectureId);
                    if (activeLecture) {
                        $timeout(function () {
                            activeLecture.duration = duration;
                        });
                    }
                })
            ]);

            $scope.$on('$destroy', function () {
                socketConnection.close();
            });
        }
    ]
);
