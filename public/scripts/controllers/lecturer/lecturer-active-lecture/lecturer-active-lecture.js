"use strict";

angular.module('application')

    .controller('LecturerActiveLectureController', [

        '$q',
        '$scope',
        '$filter',
        '$location',
        '$timeout',
        'dialogsService',
        'socketEventsManagerService',
        'activeLecturesService',
        'usersService',
        'questionsService',
        'user',
        'lecture',
        'activeLecture',
        'questions',
        'socketConnection',

        function ($q, $scope, $filter, $location, $timeout, dialogsService, socketEventsManagerService, activeLecturesService, usersService, questionsService, user, lecture, activeLecture, questions, socketConnection) {

            var userId = user.id;
            var lectureId = lecture.id;
            var pieModel = [
                {
                    value: 0,
                    label: 'Зрозуміло',
                    color: "#449d44",
                    highlight: "#398439"
                },
                {
                    value: 100,
                    label: 'Незрозуміло',
                    color: "#c9302c",
                    highlight: "#ac2925"
                }
            ];
            var activityCollection = [];
            var tabs = [
                {
                    id: 'info',
                    title: 'Інформація',
                    icon: 'fa-info-circle',
                    templateUrl: '/public/views/controllers/lecturer/lecturer-active-lecture/tabs/lecturer-info-tab-view.html',
                    isActive: false
                },
                {
                    id: 'survey',
                    title: 'Опитування',
                    icon: 'fa-pie-chart',
                    templateUrl: '/public/views/controllers/lecturer/lecturer-active-lecture/tabs/lecturer-survey-tab-view.html',
                    isActive: true
                },
                {
                    id: 'activity',
                    title: 'Активність',
                    icon: 'fa-bolt',
                    templateUrl: '/public/views/controllers/lecturer/lecturer-active-lecture/tabs/lecturer-activity-tab-view.html',
                    isActive: false
                },
                {
                    id: 'questions',
                    title: 'Запитання лектора',
                    icon: 'fa-question-circle',
                    templateUrl: '/public/views/controllers/lecturer/lecturer-active-lecture/tabs/lecturer-questions-tab-view.html',
                    isActive: false
                }
            ];

            function showPresentListeners() {
                dialogsService.showPresentListeners(activeLecture.listeners, socketConnection);
            }

            function suspendLecture() {
                activeLecturesService.suspendLecture(userId, lecture.id)
                    .then(function () {
                        $timeout(function () {
                            activeLecture.status = 'suspended';
                        });
                    });
            }

            function resumeLecture() {
                activeLecturesService.resumeLecture(userId, lecture.id)
                    .then(function () {
                        $timeout(function () {
                            activeLecture.status = 'started';
                        });
                    });
            }

            function stopLecture() {
                activeLecturesService.stopLecture(userId, lecture.id)
                    .then(function () {
                        $timeout(function () {
                            $location.path('/lecturers/' + userId + '/lectures');
                        });
                    });
            }

            function addQuestion() {

                var questions = $scope.questions;

                var questionText = ($scope.newQuestion['text']).trim();
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

                        $scope.newQuestion['text'] = '';
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

            function askQuestion(question) {

                socketConnection.emit('ask_question', {
                    question: {
                        id: question.id,
                        text: question.text,
                        type: question.type,
                        data: question.data
                    }
                });

                var askedQuestions = activeLecture.askedQuestions;
                askedQuestions.push({
                    questionId: question.id,
                    listenerAnswers: []
                });

                addActivityItem('Ви задали запитання: ' + question.text);
            }

            function getAskedQuestion(questionId) {
                return _.findWhere(activeLecture.askedQuestions, {
                    questionId: questionId
                });
            }

            function showAnsweredListeners(question) {
                dialogsService.showAnsweredListeners({
                    question: question,
                    listenerAnswers: _.findWhere(activeLecture.askedQuestions, {
                        questionId: question.id
                    }).listenerAnswers
                });
            }

            function addActivityItem(title) {
                activityCollection.unshift({
                    timestamp: _.now(),
                    title: title
                });
            }

            function setActiveTab(tab) {
                tab.isActive = true;
                $scope.tab = tab;
            }

            $scope.user = user;
            $scope.lecture = lecture;
            $scope.activeLecture = activeLecture;

            $scope.activityCollection = activityCollection;
            $scope.lectures = [];
            $scope.newQuestion = {
                text: ''
            };
            $scope.questions = questions;
            $scope.pieModel = pieModel;
            $scope.tabs = tabs;
            $scope.tab = _.find(tabs, function (tab) {
                return tab.isActive;
            });

            $scope.resumeLecture = resumeLecture;
            $scope.suspendLecture = suspendLecture;
            $scope.stopLecture = stopLecture;

            $scope.addQuestion = addQuestion;
            $scope.editQuestion = editQuestion;
            $scope.removeQuestion = removeQuestion;

            $scope.askQuestion = askQuestion;
            $scope.getAskedQuestion = getAskedQuestion;

            $scope.showPresentListeners = showPresentListeners;
            $scope.showAnsweredListeners = showAnsweredListeners;
            $scope.addActivityItem = addActivityItem;
            $scope.setActiveTab = setActiveTab;

            socketEventsManagerService.subscribe($scope, [
                socketConnection.on('on_listener_joined', function (data) {

                    var userId = data.userId;

                    $timeout(function () {

                        var listeners = activeLecture.listeners;

                        if (_.indexOf(listeners, userId) == -1) {

                            usersService.getUserName(userId)
                                .then(function (user) {
                                    $timeout(function () {
                                        listeners.push(userId);
                                        addActivityItem(user.name + ' приєднався до лекції');
                                    });
                                });
                        }
                    });
                }),
                socketConnection.on('on_listener_went', function (data) {

                    var userId = data.userId;

                    usersService.getUserName(userId)
                        .then(function (user) {
                            $timeout(function () {
                                activeLecture.listeners = _.without(activeLecture.listeners, userId);
                                addActivityItem(user.name + ' покинув лекцію');
                            });
                        });
                }),
                socketConnection.on('on_lecture_duration_changed', function (data) {

                    var duration = data.duration;

                    $timeout(function () {
                        activeLecture.duration = duration;
                    });
                }),
                socketConnection.on('on_message_received', function (data) {

                    var userId = data.userId;
                    var message = data.message;

                    usersService.getUserName(userId)
                        .then(function (user) {
                            $timeout(function () {
                                addActivityItem(user.name + ': ' + message);
                            });
                        });
                }),
                socketConnection.on('on_understanding_value_updated', function (data) {

                    var understandingValue = data.understandingValue;

                    $timeout(function () {
                        pieModel[0].value = understandingValue.toFixed(1);
                        pieModel[1].value = (100 - understandingValue).toFixed(1);
                    });
                }),
                socketConnection.on('on_answer_received', function (data) {

                    var userId = data.userId;
                    var questionId = data.questionId;
                    var answerData = data.answerData;

                    var askedQuestion = getAskedQuestion(questionId);
                    if (askedQuestion) {

                        var listenerAnswers = askedQuestion.listenerAnswers;

                        if (!_.findWhere(listenerAnswers, {
                            userId: userId
                        })) {
                            $timeout(function () {

                                listenerAnswers.push({
                                    userId: userId,
                                    answerData: answerData
                                });
                            });
                        }
                    }
                })
            ]);

            $scope.$on('$destroy', function () {
                socketConnection.close();
            });
        }
    ]
);
