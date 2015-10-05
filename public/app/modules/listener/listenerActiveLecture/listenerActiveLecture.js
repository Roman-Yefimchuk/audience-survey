"use strict";

angular.module('listener.listenerActiveLecture', [

    'filters.formatTime',
    'genericHeader',
    'services.dialogsService',
    'services.notificationsService',
    'services.socketEventsManagerService',
    'services.api.usersService',
    'listener.listenerActiveLecture.tabs.listenerActivityTab',
    'listener.listenerActiveLecture.tabs.listenerInfoTab',
    'listener.listenerActiveLecture.tabs.listenerQuestionsTab',
    'listener.listenerActiveLecture.tabs.listenerSurveyTab'

]).controller('ListenerActiveLectureController', [

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

            var UNDERSTANDABLY_VALUE = 1;
            var UNCLEAR_VALUE = 0;

            //TODO: bug
            activeLecture.listeners = _.without(activeLecture.listeners, user.id);

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

            var askedQuestions = [];
            var activityCollection = [];
            var message = {
                text: ''
            };

            var tabs = [
                {
                    id: 'info',
                    title: 'Інформація',
                    icon: 'fa-info-circle',
                    templateUrl: '/public/app/modules/listener/listenerActiveLecture/tabs/listenerInfoTab/listenerInfoTab.html',
                    isActive: false
                },
                {
                    id: 'survey',
                    title: 'Опитування',
                    icon: 'fa-pie-chart',
                    templateUrl: '/public/app/modules/listener/listenerActiveLecture/tabs/listenerSurveyTab/listenerSurveyTab.html',
                    isActive: true
                },
                {
                    id: 'activity',
                    title: 'Активність',
                    icon: 'fa-bolt',
                    templateUrl: '/public/app/modules/listener/listenerActiveLecture/tabs/listenerActivityTab/listenerActivityTab.html',
                    isActive: false
                },
                {
                    id: 'questions',
                    title: 'Запитання лектора',
                    icon: 'fa-question-circle',
                    templateUrl: '/public/app/modules/listener/listenerActiveLecture/tabs/listenerQuestionsTab/listenerQuestionsTab.html',
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

            function understandably() {
                socketConnection.emit('update_understanding_value', {
                    value: UNDERSTANDABLY_VALUE
                });
            }

            function unclear() {
                socketConnection.emit('update_understanding_value', {
                    value: UNCLEAR_VALUE
                });
            }

            function sendMessage() {

                socketConnection.emit('send_message', {
                    userId: user.id,
                    message: $scope.message['text']
                });

                message.text = '';
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

            function sendAnswer(askedQuestion) {

                dialogsService.showAnswerDialog({
                    question: {
                        text: askedQuestion.text,
                        type: askedQuestion.type,
                        data: askedQuestion.data
                    },
                    onSendAnswer: function (answerData, closeCallback) {

                        socketConnection.emit('send_answer', {
                            questionId: askedQuestion.id,
                            answerData: answerData
                        });

                        askedQuestion.answerData = answerData;
                        closeCallback();
                    }
                });
            }

            $scope.user = user;
            $scope.lecture = lecture;
            $scope.activeLecture = activeLecture;

            $scope.activityCollection = activityCollection;
            $scope.message = message;
            $scope.askedQuestions = askedQuestions;
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
            $scope.sendAnswer = sendAnswer;
            $scope.sendMessage = sendMessage;
            $scope.addActivityItem = addActivityItem;

            $scope.understandably = understandably;
            $scope.unclear = unclear;

            $scope.$on('$destroy', function () {
                socketConnection.close();
                $rootScope.$broadcast('suspendDialog:close');
            });

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

                    if (userId == user.id) {

                        $timeout(function () {
                            addActivityItem('Ви: ' + message);
                        });
                    } else {

                        usersService.getUserName(userId)
                            .then(function (user) {
                                $timeout(function () {
                                    addActivityItem(user.name + ': ' + message);
                                });
                            });
                    }
                }),
                socketConnection.on('on_understanding_value_updated', function (data) {

                    var understandingValue = data.understandingValue;

                    $timeout(function () {
                        pieModel[0].value = understandingValue.toFixed(1);
                        pieModel[1].value = (100 - understandingValue).toFixed(1);
                    });
                }),
                socketConnection.on('on_question_asked', function (data) {

                    var question = data.question;

                    $timeout(function () {

                        askedQuestions.push(_.extend(question, {
                            answerData: null
                        }));

                        addActivityItem('Викладач задав питання: ' + question.text);
                    });
                })
            ]);

            $timeout(function () {
                socketConnection.emit('joined');
            });
        }
    ]
);
