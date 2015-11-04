"use strict";

angular.module('lecturer.lectureEditor', [

    'genericHeader',
    'alloyEditor',
    'lecturer.lectureEditor.lectureLinksEditor',
    'services.api.lecturesService',

]).controller('LectureEditor', [

        '$scope',
        '$routeParams',
        'lecturesService',
        'user',
        'lecture',
        '$location',

        function ($scope, $routeParams, lecturesService, user, lecture, $location) {
            function backState() {
                $location.path('/lecturers/'+user.id+'/lectures');
            }
            function onSave() {
                lecturesService.updateLecture(user.id, lecture.id, {
                    name: lecture.name,
                    description: lecture.description,
                    links: lecture.links
                }).then(function () {
                    backState();
                });
            }
            $scope.lecture = lecture;
            $scope.backState = backState;
            $scope.onSave = onSave;
            $scope.user = user;
        }
    ]
);
