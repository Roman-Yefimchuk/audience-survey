'use strict';

angular.module('services.dialogsService', [

    'dialogs.confirmationDialog',
    'dialogs.alertDialog',
    'dialogs.lectureEditorDialog',
    'dialogs.questionEditorDialog',
    'dialogs.suspendDialog',
    'dialogs.presentListeners',
    'dialogs.answeredListenersDialog',
    'dialogs.profileEditorDialog',
    'dialogs.profileBuilderDialog',
    'dialogs.answerDialog'

]).service('dialogsService', [

        '$modal',

        function ($modal) {

            function open(modalOptions) {
                return $modal.open(modalOptions)['result'];
            }

            return {
                showConfirmation: function (options) {
                    return open({
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
                    return open({
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
                showLectureEditor: function (options) {
                    return open({
                        templateUrl: '/public/app/modules/dialogs/lectureEditorDialog/lectureEditorDialog.html',
                        controller: 'LectureEditorDialogController',
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
                    return open({
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
                    return open({
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
                    return open({
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
                showAnsweredListeners: function (options) {
                    return open({
                        templateUrl: '/public/app/modules/dialogs/answeredListenersDialog/answeredListenersDialog.html',
                        controller: 'AnsweredListenersDialogController',
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
                    return open({
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
                    return open({
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
                    return open({
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
                }
            };
        }
    ]
);