"use strict";

angular.module('lecturer.lecturerActiveLecture', [

    'filters.formatTime',
    'genericHeader',
    'tabHost',
    'services.dialogsService',
    'services.socketEventsManagerService',
    'services.api.activeLecturesService',
    'services.api.usersService',
    'lecturer.lecturerActiveLecture.tabs.lecturerActivityTab',
    'lecturer.lecturerActiveLecture.tabs.lecturerInfoTab',
    'lecturer.lecturerActiveLecture.tabs.lecturerQuestionsTab',
    'lecturer.lecturerActiveLecture.tabs.lecturerSurveyTab',
    'services.notificationsService'

]).controller('LecturerActiveLectureController', [

        '$q',
        '$scope',
        '$filter',
        '$location',
        '$timeout',
        'dialogsService',
        'socketEventsManagerService',
        'activeLecturesService',
        'usersService',
        'notificationsService',
        'user',
        'lecture',
        'activeLecture',
        'questions',
        'socketConnection',

        function ($q, $scope, $filter, $location, $timeout, dialogsService, socketEventsManagerService, activeLecturesService, usersService, notificationsService, user, lecture, activeLecture, questions, socketConnection) {

            var UNDERSTANDABLY_VALUE_INDEX = 0;
            var UNCLEAR_VALUE_INDEX = 1;

            var userId = user.id;
            var lectureId = lecture.id;

            var activityManager = (function () {

                var items = [];

                return {
                    addItem: function (text, notificationType) {

                        items.unshift({
                            timestamp: _.now(),
                            duration: activeLecture.duration,
                            text: text
                        });

                        if ($scope.activeTabId != 'activity' && notificationType) {
                            notificationsService.notify(text, notificationType);
                        }
                    },
                    getItems: function () {
                        return items;
                    }
                };
            })();

            var questionsManager = (function () {

                return {
                    addQuestion: function (question) {
                        questions.push(question);
                    },
                    removeQuestion: function (question) {
                        questions = _.without(questions, question);
                    },
                    getQuestions: function () {
                        return questions;
                    }
                };
            })();

            var askedQuestionsManager = (function () {

                return {
                    getAskedQuestion: function (questionId) {
                        return _.findWhere(activeLecture.askedQuestions, {
                            questionId: questionId
                        });
                    },
                    askQuestion: function (question) {

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

                        activityManager.addItem('Ви задали запитання: ' + question.text);
                    },
                    getAskedQuestions: function () {
                        return activeLecture.askedQuestions;
                    }
                };
            })();

            var pieChartModel = {
                options: {
                    animation: false,
                    segmentStrokeColor: '#dddddd',
                    segmentStrokeWidth: 1,
                    tooltipTemplate: "<%= label %>: <%= value %>%"
                },
                labels: ['Зрозуміло', 'Не зрозуміло'],
                data: [0, 100],
                colors: ['#449d44', '#c9302c']
            };

            function round(n, s) {
                return parseFloat(n.toFixed(s));
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

            function showPresentListeners() {
                dialogsService.showPresentListeners(activeLecture.listeners, socketConnection);
            }

            function onTabChanged(tab) {
                $scope.activeTabId = tab.id;
            }

            $scope.user = user;
            $scope.activeLecture = activeLecture;
            $scope.tabs = [
                {
                    id: 'info',
                    title: 'Інформація',
                    icon: 'fa-info-circle',
                    isActive: false,
                    controller: 'LecturerInfoTabController',
                    templateUrl: '/public/app/modules/lecturer/lecturerActiveLecture/tabs/lecturerInfoTab/lecturerInfoTab.html',
                    resolve: {
                        lecture: lecture
                    }
                },
                {
                    id: 'survey',
                    title: 'Опитування',
                    icon: 'fa-pie-chart',
                    isActive: true,
                    controller: 'LecturerSurveyTabController',
                    templateUrl: '/public/app/modules/lecturer/lecturerActiveLecture/tabs/lecturerSurveyTab/lecturerSurveyTab.html',
                    resolve: {
                        pieChartModel: pieChartModel
                    }
                },
                {
                    id: 'activity',
                    title: 'Активність',
                    icon: 'fa-bolt',
                    isActive: false,
                    controller: 'LecturerActivityTabController',
                    templateUrl: '/public/app/modules/lecturer/lecturerActiveLecture/tabs/lecturerActivityTab/lecturerActivityTab.html',
                    resolve: {
                        activityManager: activityManager
                    }
                },
                {
                    id: 'questions',
                    title: 'Запитання лектора',
                    icon: 'fa-question-circle',
                    isActive: false,
                    controller: 'LecturerQuestionTabController',
                    templateUrl: '/public/app/modules/lecturer/lecturerActiveLecture/tabs/lecturerQuestionsTab/lecturerQuestionsTab.html',
                    resolve: {
                        userId: userId,
                        lectureId: lectureId,
                        questionsManager: questionsManager,
                        askedQuestionsManager: askedQuestionsManager
                    }
                }
            ];

            $scope.resumeLecture = resumeLecture;
            $scope.suspendLecture = suspendLecture;
            $scope.stopLecture = stopLecture;
            $scope.showPresentListeners = showPresentListeners;
            $scope.onTabChanged = onTabChanged;

            $scope.$on('$destroy', function () {
                socketConnection.close();
            });

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
                                        activityManager.addItem(user.name + ' приєднався до лекції', 'info');
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
                                activityManager.addItem(user.name + ' покинув лекцію', 'info');
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
                                activityManager.addItem(user.name + ': ' + message, 'info');
                            });
                        });
                }),
                socketConnection.on('on_understanding_value_updated', function (data) {

                    var understandingValue = data.understandingValue;

                    $timeout(function () {
                        pieChartModel.data[UNDERSTANDABLY_VALUE_INDEX] = round(understandingValue, 1);
                        pieChartModel.data[UNCLEAR_VALUE_INDEX] = round(100 - understandingValue, 1);
                    });
                }),
                socketConnection.on('on_answer_received', function (data) {

                    var userId = data.userId;
                    var questionId = data.questionId;
                    var answerData = data.answerData;

                    var askedQuestion = askedQuestionsManager.getAskedQuestion(questionId);
                    if (askedQuestion) {

                        var listenerAnswers = askedQuestion.listenerAnswers;

                        if (!_.findWhere(listenerAnswers, {
                            userId: userId
                        })) {

                            usersService.getUserName(userId)
                                .then(function (user) {
                                    $timeout(function () {

                                        listenerAnswers.push({
                                            userId: userId,
                                            answerData: answerData
                                        });

                                        notificationsService.info(user.name + ' дав відповідь на питання');
                                    });
                                });
                        }
                    }
                })
            ]);

            $timeout(function () {
                socketConnection.emit('joined');
            });
        }
    ]
);
