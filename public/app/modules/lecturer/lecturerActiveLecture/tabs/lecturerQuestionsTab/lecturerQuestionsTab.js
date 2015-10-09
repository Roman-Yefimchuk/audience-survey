"use strict";

angular.module('lecturer.lecturerActiveLecture.tabs.lecturerQuestionsTab', [

    'services.dialogsService',
    'services.api.questionsService'

]).controller('LecturerQuestionTabController', [

        '$scope',
        'savedState',
        'dialogsService',
        'questionsService',
        'userId',
        'lectureId',
        'questionsManager',
        'askedQuestionsManager',


        function ($scope, savedState, dialogsService, questionsService, userId, lectureId, questionsManager, askedQuestionsManager) {

            function addQuestion() {

                var questionText = ($scope.questionText).trim();
                if (questionText) {

                    questionsService.createQuestion(userId, lectureId, {
                        text: questionText,
                        type: 'default',
                        data: {
                            yes: 'Так',
                            no: 'Ні'
                        }
                    }).then(function (response) {

                        questionsManager.addQuestion({
                            id: response.questionId,
                            text: questionText,
                            type: 'default',
                            data: {
                                yes: 'Так',
                                no: 'Ні'
                            }
                        });

                        $scope.questionText = '';
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
                                questionsManager.removeQuestion(question);
                                closeCallback();
                            });
                    }
                });
            }

            function getQuestions() {
                return questionsManager.getQuestions();
            }

            function showAnsweredQuestionInfo(question) {
                dialogsService.showAnsweredQuestionInfoDialog({
                    question: question,
                    listenerAnswers: getAskedQuestion(question.id).listenerAnswers
                });
            }

            function getAskedQuestion(questionId) {
                return askedQuestionsManager.getAskedQuestion(questionId);
            }

            function askQuestion(question) {
                askedQuestionsManager.askQuestion(question);
            }

            $scope.questionText = savedState.questionText || '';

            $scope.addQuestion = addQuestion;
            $scope.editQuestion = editQuestion;
            $scope.removeQuestion = removeQuestion;
            $scope.getQuestions = getQuestions;

            $scope.showAnsweredQuestionInfo = showAnsweredQuestionInfo;
            $scope.getAskedQuestion = getAskedQuestion;
            $scope.askQuestion = askQuestion;

            $scope.$watch('questionText', function (questionText) {
                savedState.questionText = questionText;
            });
        }
    ]
);
