"use strict";

angular.module('footerWidget', [

    'services.dialogsService',
    'services.api.feedbackService',
    'services.api.profilesService'

]).directive('footerWidget', [

        '$q',
        '$cookies',
        'dialogsService',
        'feedbackService',
        'profilesService',

        function ($q, $cookies, dialogsService, feedbackService, profilesService) {
            return {
                replace: true,
                templateUrl: '/public/app/modules/footerWidget/footerWidget.html',
                controller: ['$scope', function ($scope) {

                    function openInfoDialog() {
                        dialogsService.showInfoDialog();
                    }

                    function openFeedbackDialog() {

                        $q(function (resolve) {

                            if ($cookies.userId && $cookies.token) {
                                profilesService.getProfile($cookies.userId)
                                    .then(function (profile) {
                                        resolve(profile.email);
                                    }, function () {
                                        resolve();
                                    });
                            } else {
                                resolve();
                            }
                        }).then(function (email) {

                            dialogsService.showFeedbackDialog({
                                email: email,
                                onFeedbackSent: function (feedbackModel, closeCallback) {
                                    feedbackService.sendFeedback(feedbackModel)
                                        .then(function () {
                                            closeCallback();
                                        }, function () {
                                            dialogsService.showAlert({
                                                title: 'Упс...',
                                                message: 'Не вдалося відправити відгук'
                                            });
                                        });
                                }
                            });
                        });
                    }

                    $scope.openInfoDialog = openInfoDialog;
                    $scope.openFeedbackDialog = openFeedbackDialog;
                }]
            };
        }
    ]
);