"use strict";

angular.module('footerWidget', [

    'services.dialogsService',
    'services.api.feedbackService'

]).directive('footerWidget', [

        'dialogsService',
        'feedbackService',

        function (dialogsService, feedbackService) {
            return {
                replace: true,
                templateUrl: '/public/app/modules/footerWidget/footerWidget.html',
                controller: ['$scope', function ($scope) {

                    function openInfoDialog() {
                        dialogsService.showInfoDialog();
                    }

                    function openFeedbackDialog() {
                        dialogsService.showFeedbackDialog({
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
                    }

                    $scope.openInfoDialog = openInfoDialog;
                    $scope.openFeedbackDialog = openFeedbackDialog;
                }]
            };
        }
    ]
);