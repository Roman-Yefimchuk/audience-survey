"use strict";

angular.module('application')

    .service('activeLecturesService', [

        '$q',
        'httpClientService',

        function ($q, httpClientService) {

            function getActiveLectures(userId) {
                return httpClientService.get('users/' + userId + '/activeLectures');
            }

            function getOwnActiveLectures(userId) {
                return httpClientService.get('users/' + userId + '/activeLectures/own');
            }

            function getActiveLecture(userId, lectureId) {
                return httpClientService.get('users/' + userId + '/activeLectures/' + lectureId);
            }

            function startLecture(userId, lectureId) {
                return httpClientService.get('users/' + userId + '/activeLectures/' + lectureId + '/start');
            }

            function suspendLecture(userId, lectureId) {
                return httpClientService.get('users/' + userId + '/activeLectures/' + lectureId + '/suspend');
            }

            function resumeLecture(userId, lectureId) {
                return httpClientService.get('users/' + userId + '/activeLectures/' + lectureId + '/resume');
            }

            function stopLecture(userId, lectureId) {
                return httpClientService.get('users/' + userId + '/activeLectures/' + lectureId + '/stop');
            }

            return {
                getActiveLectures: getActiveLectures,
                getOwnActiveLectures: getOwnActiveLectures,
                getActiveLecture: getActiveLecture,
                startLecture: startLecture,
                suspendLecture: suspendLecture,
                resumeLecture: resumeLecture,
                stopLecture: stopLecture
            };
        }
    ]
);