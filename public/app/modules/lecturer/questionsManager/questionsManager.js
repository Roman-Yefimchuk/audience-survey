"use strict";

angular.module('lecturer.questionsManager', [

    'genericHeader',
    'services.dialogsService',
    'services.api.questionsService'

]).controller('QuestionsManagerController', [

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

                var questionText = $scope['newQuestion'].trim();
                if (questionText) {

                    questionsService.createQuestion(userId, lectureId, {
                        text: questionText,
                        type: 'default',
                        data: {
                            yes: 'Так',
                            no: 'Ні'
                        }
                    }).then(function (response) {

                        questions.push({
                            id: response.questionId,
                            text: questionText,
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
                        text: question.text,
                        type: question.type,
                        data: question.data
                    },
                    onSave: function (questionModel, closeCallback) {

                        questionsService.updateQuestion(userId, lectureId, question.id, {
                            text: questionModel.text,
                            type: questionModel.type,
                            data: questionModel.data
                        }).then(function () {

                            question.text = questionModel.text;
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

            function showAnswerDialog(question) {
                dialogsService.showAnswerDialog({
                    question: question,
                    onSendAnswer: function (answerData, closeCallback) {
                        alert(JSON.stringify(answerData));
                        closeCallback();
                    }
                });
            }

            $scope.newQuestion = '';
            $scope.user = user;
            $scope.questions = questions;

            $scope.addQuestion = addQuestion;
            $scope.editQuestion = editQuestion;
            $scope.removeQuestion = removeQuestion;
            $scope.clearInput = clearInput;

            $scope.showAnswerDialog = showAnswerDialog;
        }
    ]
);
