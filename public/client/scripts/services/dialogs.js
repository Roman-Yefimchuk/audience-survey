'use strict';

angular.module('application')

    .service('dialogsService', [

        '$modal',

        function ($modal, $window, $timeout) {

            function open(modalOptions) {
                return $modal.open(modalOptions);
            }

            return {
                showConfirmation: function (options) {
                    return open({
                        templateUrl: '/client/views/controllers/dialogs/confirmation-dialog-view.html',
                        controller: 'ConfirmationDialogController',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            options: function () {
                                return options;
                            }
                        }
                    });
                },
                showAlert: function (options) {
                    return open({
                        templateUrl: '/client/views/controllers/dialogs/alert-dialog-view.html',
                        controller: 'AlertDialogController',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            options: function () {
                                return options;
                            }
                        }
                    });
                },
                showFeedback: function (options) {
                    return open({
                        templateUrl: '/client/views/controllers/dialogs/feedback-view.html',
                        controller: 'FeedbackDialogController',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            options: function () {
                                return options;
                            }
                        }
                    });
                },
                showItemEditor: function (options) {
                    return open({
                        templateUrl: '/client/views/controllers/dialogs/item-editor-view.html',
                        controller: 'ItemEditorController',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            options: function () {
                                return options;
                            }
                        }
                    });
                },
                showSuspendedDialog: function (options) {
                    return open({
                        templateUrl: '/client/views/controllers/dialogs/suspended-dialog.html',
                        controller: 'SuspendDialogController',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            options: function () {
                                return options;
                            }
                        }
                    });
                }
            };
        }
    ]
);