'use strict';

angular.module('services.dialogsService', [

    'dialogs.confirmationDialog',
    'dialogs.alertDialog',
    'dialogs.questionEditorDialog',
    'dialogs.suspendDialog',
    'dialogs.presentListeners',
    'dialogs.answeredQuestionInfoDialog',
    'dialogs.profileEditorDialog',
    'dialogs.profileBuilderDialog',
    'dialogs.answerDialog',
    'dialogs.feedbackDialog',
    'dialogs.infoDialog',
    'dialogs.listenerAnswerInfoDialog'

]).service('dialogsService', [

        '$modal',

        function ($modal) {

            function showDialog(modalOptions) {
                return $modal.open(modalOptions)['result'];
            }

            return {
                showConfirmation: function (options) {
                    return showDialog({
                        templateUrl: '/public/app/modules/dialogs/confirmationDialog/confirmationDialog.html',
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
                    return showDialog({
                        templateUrl: '/public/app/modules/dialogs/alertDialog/alertDialog.html',
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
                showQuestionEditor: function (options) {
                    return showDialog({
                        templateUrl: '/public/app/modules/dialogs/questionEditorDialog/questionEditorDialog.html',
                        controller: 'QuestionEditorDialogController',
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
                    return showDialog({
                        templateUrl: '/public/app/modules/dialogs/suspendDialog/suspendedDialog.html',
                        controller: 'SuspendDialogController',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            options: function () {
                                return options;
                            }
                        }
                    });
                },
                showPresentListeners: function (listeners, socketConnection) {
                    return showDialog({
                        templateUrl: '/public/app/modules/dialogs/presentListenersDialog/presentListenersDialog.html',
                        controller: 'PresentListenersController',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            listeners: function () {
                                return angular.copy(listeners);
                            },
                            socketConnection: function () {
                                return socketConnection;
                            }
                        }
                    });
                },
                showAnsweredQuestionInfoDialog: function (options) {
                    return showDialog({
                        templateUrl: '/public/app/modules/dialogs/answeredQuestionInfoDialog/answeredQuestionInfoDialog.html',
                        controller: 'AnsweredQuestionInfoDialogController',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            options: function () {
                                return options;
                            }
                        }
                    });
                },
                showProfileEditor: function (options) {
                    return showDialog({
                        templateUrl: '/public/app/modules/dialogs/profileEditorDialog/profileEditorDialog.html',
                        controller: 'ProfileEditorDialogController',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            options: function () {
                                return options;
                            }
                        }
                    });
                },
                showProfileBuilderDialog: function (options) {
                    return showDialog({
                        templateUrl: '/public/app/modules/dialogs/profileBuilderDialog/profileBuilderDialog.html',
                        controller: 'ProfileBuilderDialogController',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            options: function () {
                                return options;
                            }
                        }
                    });
                },
                showAnswerDialog: function (options) {
                    return showDialog({
                        templateUrl: '/public/app/modules/dialogs/answerDialog/answerDialog.html',
                        controller: 'AnswerDialogController',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            options: function () {
                                return options;
                            }
                        }
                    });
                },
                showFeedbackDialog: function (options) {
                    return showDialog({
                        templateUrl: '/public/app/modules/dialogs/feedbackDialog/feedbackView.html',
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
                showInfoDialog: function () {
                    return showDialog({
                        templateUrl: '/public/app/modules/dialogs/infoDialog/infoDialog.html',
                        controller: 'InfoDialogController',
                        backdrop: 'static',
                        keyboard: false
                    });
                },
                showListenerAnswerInfoDialog: function (askedQuestion) {
                    return showDialog({
                        templateUrl: '/public/app/modules/dialogs/listenerAnswerInfoDialog/listenerAnswerInfoDialog.html',
                        controller: 'ListenerAnswerInfoDialogController',
                        backdrop: 'static',
                        keyboard: false,
                        resolve: {
                            askedQuestion: function () {
                                return askedQuestion;
                            }
                        }
                    });
                }
            };
        }
    ]
);