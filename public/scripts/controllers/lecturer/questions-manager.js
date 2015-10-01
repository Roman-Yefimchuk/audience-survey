"use strict";

angular.module('application')

    .controller('QuestionsManagerController', [

        '$scope',
        '$location',
        '$routeParams',
        'dialogsService',
        'questionsService',
        'user',
        'questions',

        function ($scope, $location, $routeParams, dialogsService, questionsService, user, questions) {

            var userId = user.id;
            var lectureId = $routeParams.lectureId;

            function addQuestion() {

                var questions = $scope.questions;

                var questionTitle = $scope['newQuestion'].trim();
                if (questionTitle) {

                    questionsService.createQuestion(userId, lectureId, {
                        title: questionTitle,
                        type: 'default',
                        data: {
                            yes: 'Так',
                            no: 'Ні'
                        }
                    }).then(function (response) {

                        questions.push({
                            id: response.questionId,
                            title: questionTitle,
                            type: 'default',
                            data: {
                                yes: 'Так',
                                no: 'Ні'
                            }
                        });

                        $scope.newQuestion = '';
                    });
                }
            }

            function editQuestion(question) {

                dialogsService.showQuestionEditor({
                    editorTitle: 'Редагувати запитання',
                    questionModel: {
                        title: question.title,
                        type: question.type,
                        data: question.data
                    },
                    onSave: function (questionModel, closeCallback) {

                        questionsService.updateQuestion(userId, lectureId, question.id, {
                            title: questionModel.title,
                            type: questionModel.type,
                            data: questionModel.data
                        }).then(function () {

                            question.title = questionModel.title;
                            question.type = questionModel.type;
                            question.data = questionModel.data;
                            closeCallback();
                        });
                    }
                });
            }

            function removeQuestion(question) {

                dialogsService.showConfirmation({
                    title: 'Видалити запитання',
                    message: 'Ви дійсно хочете видалити запитання?',
                    onAccept: function (closeCallback) {

                        questionsService.removeQuestion(userId, lectureId, question.id)
                            .then(function () {
                                $scope.questions = _.without($scope.questions, question);
                                closeCallback();
                            });
                    }
                });
            }

            function clearInput() {
                $scope.newQuestion = '';
            }

            $scope.newQuestion = '';
            $scope.user = user;
            $scope.questions = questions;

            $scope.addQuestion = addQuestion;
            $scope.editQuestion = editQuestion;
            $scope.removeQuestion = removeQuestion;
            $scope.clearInput = clearInput;
        }
    ]
);
