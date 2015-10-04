'use strict';

angular.module('application')

    .service('dialogsService', [

        '$modal',

        function ($modal) {

            function open(modalOptions) {
                return $modal.open(modalOptions)['result'];
            }

            return {
                showConfirmation: function (options) {
                    return open({
                        templateUrl: '/public/views/controllers/dialogs/confirmation-dialog-view.html',
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
                        templateUrl: '/public/views/controllers/dialogs/alert-dialog-view.html',
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
                        templateUrl: '/public/views/controllers/dialogs/lecture-editor-dialog-view.html',
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
                        templateUrl: '/public/views/controllers/dialogs/question-editor/question-editor-dialog-view.html',
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
                        templateUrl: '/public/views/controllers/dialogs/suspended-dialog.html',
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
                        templateUrl: '/public/views/controllers/dialogs/present-listeners-dialog-view.html',
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
                        templateUrl: '/public/views/controllers/dialogs/answered-listeners-dialog-view.html',
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
                        templateUrl: '/public/views/controllers/dialogs/profile-editor-dialog-view.html',
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
                        templateUrl: '/public/views/controllers/dialogs/profile-builder-dialog-view.html',
                        controller: 'ProfileBuilderDialogController',
                        resolve: {
                            options: function () {
                                return options;
                            }
                        }
                    });
                },
                showAnswerDialog: function (options) {
                    return open({
                        templateUrl: '/public/views/controllers/dialogs/answer-dialog/answer-dialog-view.html',
                        controller: 'AnswerDialogController',
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