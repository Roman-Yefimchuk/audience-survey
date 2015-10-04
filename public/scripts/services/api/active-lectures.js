"use strict";

angular.module('application')

    .service('activeLecturesService', [

        '$q',
        'httpClientService',

        function ($q, httpClientService) {

            function getLecturerActiveLectures(userId) {
                return httpClientService.get('users/' + userId + '/lecturerActiveLectures');
            }

            function getLecturerActiveLecture(userId, lectureId) {
                return httpClientService.get('users/' + userId + '/lecturerActiveLectures/' + lectureId);
            }

            function getListenerActiveLectures(userId) {
                return httpClientService.get('users/' + userId + '/listenerActiveLectures');
            }

            function getListenerActiveLecture(userId, lectureId) {
                return httpClientService.get('users/' + userId + '/listenerActiveLectures/' + lectureId);
            }

            function startLecture(userId, lectureId) {
                return httpClientService.get('users/' + userId + '/lecturerActiveLectures/' + lectureId + '/start');
            }

            function suspendLecture(userId, lectureId) {
                return httpClientService.get('users/' + userId + '/lecturerActiveLectures/' + lectureId + '/suspend');
            }

            function resumeLecture(userId, lectureId) {
                return httpClientService.get('users/' + userId + '/lecturerActiveLectures/' + lectureId + '/resume');
            }

            function stopLecture(userId, lectureId) {
                return httpClientService.get('users/' + userId + '/lecturerActiveLectures/' + lectureId + '/stop');
            }

            return {
                getLecturerActiveLectures: getLecturerActiveLectures,
                getLecturerActiveLecture: getLecturerActiveLecture,
                getListenerActiveLectures: getListenerActiveLectures,
                getListenerActiveLecture: getListenerActiveLecture,
                startLecture: startLecture,
                suspendLecture: suspendLecture,
                resumeLecture: resumeLecture,
                stopLecture: stopLecture
            };
        }
    ]
);