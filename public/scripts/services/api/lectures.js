"use strict";

angular.module('application')

    .service('lecturesService', [

        '$q',
        'httpClientService',

        function ($q, httpClientService) {

            function getLectures(userId) {
                return httpClientService.get('users/' + userId + '/lectures');
            }

            function createLecture(userId, data) {
                return httpClientService.post('users/' + userId + '/lectures/create', data);
            }

            function getLecture(userId, lectureId) {
                return httpClientService.get('users/' + userId + '/lectures/' + lectureId);
            }

            function updateLecture(userId, lectureId, data) {
                return httpClientService.post('users/' + userId + '/lectures/' + lectureId + '/update', data);
            }

            function removeLecture(userId, lectureId) {
                return httpClientService.get('users/' + userId + '/lectures/' + lectureId + '/remove');
            }

            return {
                getLectures: getLectures,
                createLecture: createLecture,
                getLecture: getLecture,
                updateLecture: updateLecture,
                removeLecture: removeLecture
            };
        }
    ]
);