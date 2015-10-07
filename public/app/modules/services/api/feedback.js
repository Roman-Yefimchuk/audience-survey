"use strict";

angular.module('services.api.feedbackService', [

    'services.httpClientService'

]).service('feedbackService', [

        'httpClientService',

        function (httpClientService) {

            function sendFeedback(data) {
                return httpClientService.post('sendFeedback', data);
            }

            return {
                sendFeedback: sendFeedback
            };
        }
    ]
);