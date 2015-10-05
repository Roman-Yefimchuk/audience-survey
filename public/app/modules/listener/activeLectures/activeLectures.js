"use strict";

angular.module('listener.activeLectures', [

    'filters.formatTime',
    'genericHeader',
    'services.dialogsService',
    'services.socketEventsManagerService'

]).controller('ActiveLecturesController', [

        '$scope',
        '$timeout',
        '$location',
        'dialogsService',
        'socketEventsManagerService',
        'user',
        'activeLectures',
        'socketConnection',

        function ($scope, $timeout, $location, dialogsService, socketEventsManagerService, user, activeLectures, socketConnection) {

            function showPresentListeners(activeLecture) {
                dialogsService.showPresentListeners(activeLecture.listeners, socketConnection);
            }

            function getActiveLecture(lectureId) {
                return _.findWhere($scope.activeLectures, {
                    id: lectureId
                });
            }

            $scope.user = user;
            $scope.activeLectures = activeLectures;

            $scope.showPresentListeners = showPresentListeners;

            socketEventsManagerService.subscribe($scope, [
                socketConnection.on('on_lecture_started', function (data) {

                    var activeLectures = $scope.activeLectures;

                    $timeout(function () {
                        activeLectures.push({
                            id: data.lectureId,
                            name: data.name,
                            lecturer: data.lecturer,
                            duration: 0,
                            status: 'started',
                            listeners: []
                        });
                    });
                }),
                socketConnection.on('on_lecture_resumed', function (data) {

                    var lectureId = data.lectureId;

                    var activeLecture = getActiveLecture(lectureId);
                    if (activeLecture) {

                        $timeout(function () {
                            activeLecture.status = 'started';
                        });
                    }
                }),
                socketConnection.on('on_lecture_suspended', function (data) {

                    var lectureId = data.lectureId;

                    var activeLecture = getActiveLecture(lectureId);
                    if (activeLecture) {

                        $timeout(function () {
                            activeLecture.status = 'suspended';
                        });
                    }
                }),
                socketConnection.on('on_lecture_stopped', function (data) {

                    var lectureId = data.lectureId;

                    var activeLecture = getActiveLecture(lectureId);
                    if (activeLecture) {

                        $timeout(function () {
                            $scope.activeLectures = _.without($scope.activeLectures, activeLecture);
                        });
                    }
                }),
                socketConnection.on('on_listener_joined', function (data) {

                    var lectureId = data.lectureId;
                    var userId = data.userId;

                    var activeLecture = getActiveLecture(lectureId);
                    if (activeLecture) {

                        $timeout(function () {

                            var listeners = activeLecture.listeners;

                            if (_.indexOf(listeners, userId) == -1) {
                                listeners.push(userId);
                            }
                        });
                    }
                }),
                socketConnection.on('on_listener_went', function (data) {

                    var lectureId = data.lectureId;
                    var userId = data.userId;

                    var activeLecture = getActiveLecture(lectureId);
                    if (activeLecture) {

                        $timeout(function () {
                            activeLecture.listeners = _.without(activeLecture.listeners, userId);
                        });
                    }
                }),
                socketConnection.on('on_lecturer_joined', function (data) {
                }),
                socketConnection.on('on_lecturer_went', function (data) {
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
