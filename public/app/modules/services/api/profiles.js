"use strict";

angular.module('services.api.profilesService', [

    'services.httpClientService'

]).service('profilesService', [

        '$q',
        'httpClientService',

        function ($q, httpClientService) {

            function getProfile(userId) {
                return httpClientService.get('users/' + userId + '/profile');
            }

            function updateProfile(userId, data) {
                return httpClientService.post('users/' + userId + '/profile/update', data);
            }

            return {
                getProfile: getProfile,
                updateProfile: updateProfile
            };
        }
    ]
);