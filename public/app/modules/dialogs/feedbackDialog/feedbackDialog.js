"use strict";

angular.module('dialogs.feedbackDialog', [

    'constants'

]).controller('FeedbackDialogController', [

        '$scope',
        '$modalInstance',
        'options',
        'EMAIL_PATTERN',

        function ($scope, $modalInstance, options, emailPattern) {

            var onFeedbackSent = options.onFeedbackSent || function (closeCallback) {
                closeCallback();
            };

            var model = {
                subject: "",
                senderAddress: "",
                message: ""
            };

            function isSubjectValid() {
                return (model.subject || '').length > 0;
            }

            function isSenderAddressValid() {
                var sender = (model.senderAddress || '').toLowerCase();
                return emailPattern.test(sender);
            }

            function isMessageValid() {
                return (model.message || '').length > 0;
            }

            function isFormEnabled() {
                return isSubjectValid() && isSenderAddressValid() && isMessageValid();
            }

            function send() {
                onFeedbackSent(model, function () {
                    $modalInstance.close();
                });
            }

            function cancel() {
                $modalInstance.close();
            }

            $scope.model = model;

            $scope.isSubjectValid = isSubjectValid;
            $scope.isSenderAddressValid = isSenderAddressValid;
            $scope.isMessageValid = isMessageValid;
            $scope.isFormEnabled = isFormEnabled;
            $scope.send = send;
            $scope.cancel = cancel;
        }
    ]
);
