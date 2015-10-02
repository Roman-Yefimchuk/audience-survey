"use strict";

angular.module('application')

    .controller('ListenerActiveLectureController', [

        '$q',
        '$scope',
        '$rootScope',
        '$location',
        '$timeout',
        'dialogsService',
        'notificationsService',
        'socketEventsManagerService',
        'usersService',
        'user',
        'lecture',
        'activeLecture',
        'socketConnection',

        function ($q, $scope, $rootScope, $location, $timeout, dialogsService, notificationsService, socketEventsManagerService, usersService, user, lecture, activeLecture, socketConnection) {

            //TODO: bug
            activeLecture.listeners = _.without(activeLecture.listeners, user.id);

            var answerForms = {
                'default': '/client/views/controllers/lecture-room/tabs/answer-forms/default/' +
                    'substrate-view.html',
                'single-choice': '/client/views/controllers/lecture-room/tabs/answer-forms/multi-choice/' +
                    'substrate-view.html',
                'multi-choice': '/client/views/controllers/lecture-room/tabs/answer-forms/single-choice/' +
                    'substrate-view.html',
                'range': '/client/views/controllers/lecture-room/tabs/answer-forms/range/' +
                    'substrate-view.html'
            };

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

            var teacherQuestions = [];
            var activityCollection = [];
            var message = {
                text: ''
            };

            var tabs = [
                {
                    id: 'lecture-info',
                    title: 'Інформація',
                    icon: 'fa-info-circle',
                    templateUrl: '/public/views/controllers/listener/listener-active-lecture/tabs/listener-info-tab-view.html',
                    isActive: false
                },
                {
                    id: 'survey',
                    title: 'Опитування',
                    icon: 'fa-pie-chart',
                    templateUrl: '/public/views/controllers/listener/listener-active-lecture/tabs/listener-survey-tab-view.html',
                    isActive: true
                },
                {
                    id: 'activity',
                    title: 'Активність',
                    icon: 'fa-bolt',
                    templateUrl: '/public/views/controllers/listener/listener-active-lecture/tabs/listener-activity-tab-view.html',
                    isActive: false
                },
                {
                    id: 'questions',
                    title: 'Запитання лектора',
                    icon: 'fa-question-circle',
                    templateUrl: '/public/views/controllers/listener/listener-active-lecture/tabs/listener-questions-tab-view.html',
                    isActive: false
                }
            ];

            function showSuspendDialog() {
                dialogsService.showSuspendedDialog({
                    leaveCallback: function (closeCallback) {
                        quit().then(function () {
                            closeCallback();
                        });
                    }
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

            function subscribeForSocketEvent() {

                $scope.$on('socketsService:questionAsked', function (event, data) {
                    var lecture = $scope.lecture;
                    if (data['lectureId'] == lecture.id) {

                        var question = data['question'];

                        teacherQuestions.push({
                            id: question.id,
                            title: question.title,
                            type: question.type,
                            data: question.data,
                            answer: undefined
                        });

                        $timeout(function () {
                            addActivityItem('Викладач задав питання: ' + question.title);
                        });
                    }
                });
            }

            function updateStatistic(value) {
                var socketConnection = $scope.socketConnection;
                socketConnection.updateStatistic(lectureId, value);
            }

            function sendMessage() {

                var message = $scope.message;
                var socketConnection = $scope.socketConnection;
                socketConnection.sendMessage(lectureId, message.text);

                addActivityItem('Ви: ' + message.text);

                message.text = '';
            }

            function replyForTeacherQuestion(question, answer) {
                var socketConnection = $scope.socketConnection;
                var questionId = question.id;
                question.answer = answer;
                socketConnection.replyForTeacherQuestion(lectureId, questionId, answer);
            }

            function showPresentListeners() {
                dialogsService.showPresentListeners(activeLecture.listeners, socketConnection);
            }

            function quit() {
                return $q(function (resolve, reject) {
                    dialogsService.showConfirmation({
                        title: "Вихід",
                        message: "Ви дійсно хочете покинути лекцію?",
                        onAccept: function (closeCallback) {
                            closeCallback();
                            $location.path('/listeners/' + user.id + '/activeLectures');
                            resolve();
                        },
                        onReject: function (closeCallback) {
                            closeCallback();
                            reject();
                        }
                    });
                });
            }

            $scope.$on('$destroy', function () {
                socketConnection.close();
                $rootScope.$broadcast('suspendDialog:close');
            });

            $scope.user = user;
            $scope.lecture = lecture;
            $scope.activeLecture = activeLecture;

            $scope.answerForms = answerForms;
            $scope.activityCollection = activityCollection;
            $scope.message = message;
            $scope.teacherQuestions = teacherQuestions;
            $scope.showView = true;
            $scope.pieModel = pieModel;
            $scope.pieOptions = {
                segmentShowStroke: true,
                segmentStrokeColor: "#fff",
                segmentStrokeWidth: 1,
                animateRotate: false
            };
            $scope.tabs = tabs;
            $scope.tab = _.find(tabs, function (tab) {
                return tab.isActive;
            });

            $scope.setActiveTab = setActiveTab;
            $scope.showPresentListeners = showPresentListeners;
            $scope.quit = quit;
            $scope.replyForTeacherQuestion = replyForTeacherQuestion;
            $scope.sendMessage = sendMessage;
            $scope.updateStatistic = updateStatistic;
            $scope.addActivityItem = addActivityItem;

            if (activeLecture.status == 'suspended') {
                showSuspendDialog();
            }

            socketEventsManagerService.subscribe($scope, [
                socketConnection.on('on_lecture_suspended', function () {

                    $timeout(function () {
                        addActivityItem('Лекція призупинена');
                    });

                    showSuspendDialog();
                }),
                socketConnection.on('on_lecture_resumed', function () {

                    $rootScope.$broadcast('suspendDialog:close');

                    $timeout(function () {
                        addActivityItem('Лекція продовжена');
                    });
                }),
                socketConnection.on('on_lecture_stopped', function () {

                    $rootScope.$broadcast('suspendDialog:close');

                    dialogsService.showAlert({
                        context: {
                            activeLecture: activeLecture
                        },
                        title: 'Лекція закінчена',
                        message: '' +
                            'Лекція на тему "<b>{{ activeLecture.name }}</b>" закінчена.' +
                            '<br>' +
                            'Дякуємо за увагу.',
                        onClose: function (closeCallback) {
                            $location.path('/listeners/' + user.id + '/activeLectures');
                            closeCallback();
                        }
                    });
                }),
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
                socketConnection.on('on_statistic_updated', function (data) {

                    var understandingValue = data.understandingValue;

                    $timeout(function () {
                        pieModel[0].value = understandingValue.toFixed(1);
                        pieModel[1].value = (100 - understandingValue).toFixed(1);
                    });
                }),
                socketConnection.on('on_answer_received', function (data) {
                })
            ]);
        }
    ]
);
