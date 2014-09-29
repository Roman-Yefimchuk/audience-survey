"use strict";

angular.module('application')

    .controller('QuestionsController', [

        '$scope',
        '$location',
        '$routeParams',
        '$timeout',
        'apiService',
        'dialogsService',
        'loaderService',
        'socketsService',
        'userService',
        'SOCKET_URL',

        function ($scope, $location, $routeParams, $timeout, apiService, dialogsService, loaderService, socketsService, userService, SOCKET_URL) {

            var lectureId = $routeParams.lectureId;

            function addQuestion() {
                var questions = $scope.questions;

                var questionTitle = $scope['newQuestion'].trim();
                if (questionTitle) {
                    apiService.createQuestion(lectureId, questionTitle, {
                        success: function (response) {
                            questions.push({
                                id: response.questionId,
                                title: questionTitle
                            });
                            $scope.newQuestion = '';
                        }
                    });
                }
            }

            function editQuestion(question) {
                dialogsService.showItemEditor({
                    dialogTitle: 'Редагувати запитання',
                    itemTitle: question.title,
                    onUpdate: function (title, closeCallback) {
                        apiService.updateQuestion(question.id, title, {
                            success: function () {
                                question.title = title;
                                closeCallback();
                            }
                        });
                    }
                });
            }

            function removeQuestion(question) {
                apiService.removeQuestion(question.id, {
                    success: function () {
                        $scope.questions = _.without($scope.questions, question);
                    }
                });
            }

            function clearInput() {
                $scope.newQuestion = '';
            }

            function askQuestion(question) {

                var socketConnection = $scope.socketConnection;
                socketConnection.askQuestion(lectureId, question.title);

                dialogsService.showAlert({
                    title: 'Успіх',
                    message: 'Запитання задане аудиторії успішно'
                });
            }

            $scope.newQuestion = '';
            $scope.questions = [];
            $scope.loading = false;

            $scope.addQuestion = addQuestion;
            $scope.editQuestion = editQuestion;
            $scope.removeQuestion = removeQuestion;
            $scope.clearInput = clearInput;
            $scope.askQuestion = askQuestion;

            loaderService.showLoader();

            userService.getData({
                success: function (user) {
                    socketsService.openCollection({
                        url: SOCKET_URL,
                        userId: user.userId
                    }, function (socketConnection) {

                        apiService.getQuestionsByLectureId(lectureId, {
                            success: function (response) {
                                $timeout(function () {

                                    $scope.socketConnection = socketConnection;
                                    $scope.questions = response.questions;
                                    $scope.user = user;

                                    loaderService.hideLoader();
                                });
                            }
                        });
                    })
                },
                failure: function (error) {
                    $location.path('/');
                    loaderService.hideLoader();
                }
            });
        }
    ]
);
