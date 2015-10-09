"use strict";

angular.module('listener.listenerActiveLecture', [

    'filters.formatTime',
    'genericHeader',
    'tabHost',
    'services.dialogsService',
    'services.socketEventsManagerService',
    'services.api.usersService',
    'services.notificationsService',
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
        'socketEventsManagerService',
        'usersService',
        'notificationsService',
        'user',
        'lecture',
        'activeLecture',
        'socketConnection',

        function ($q, $scope, $rootScope, $location, $timeout, dialogsService, socketEventsManagerService, usersService, notificationsService, user, lecture, activeLecture, socketConnection) {

            var UNDERSTANDABLY_VALUE_INDEX = 0;
            var UNCLEAR_VALUE_INDEX = 1;

            //TODO: bug
            activeLecture.listeners = _.without(activeLecture.listeners, user.id);

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

            var askedQuestionsManager = (function () {

                var askedQuestions = [];

                return {
                    addAskedQuestion: function (question) {

                        askedQuestions.push(_.extend(question, {
                            answerData: null
                        }));

                        activityManager.addItem('Викладач задав питання: ' + question.text, 'info');
                    },
                    getAskedQuestions: function () {
                        return askedQuestions;
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

            function showSuspendDialog() {
                dialogsService.showSuspendedDialog({
                    leaveCallback: function (closeCallback) {
                        quit().then(function () {
                            closeCallback();
                        });
                    }
                });
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
                    controller: 'ListenerInfoTabController',
                    templateUrl: '/public/app/modules/listener/listenerActiveLecture/tabs/listenerInfoTab/listenerInfoTab.html',
                    resolve: {
                        lecture: lecture
                    }
                },
                {
                    id: 'survey',
                    title: 'Опитування',
                    icon: 'fa-pie-chart',
                    isActive: true,
                    controller: 'ListenerSurveyTabController',
                    templateUrl: '/public/app/modules/listener/listenerActiveLecture/tabs/listenerSurveyTab/listenerSurveyTab.html',
                    resolve: {
                        pieChartModel: pieChartModel,
                        socketConnection: socketConnection
                    }
                },
                {
                    id: 'activity',
                    title: 'Активність',
                    icon: 'fa-bolt',
                    isActive: false,
                    controller: 'ListenerActivityTabController',
                    templateUrl: '/public/app/modules/listener/listenerActiveLecture/tabs/listenerActivityTab/listenerActivityTab.html',
                    resolve: {
                        userId: user.id,
                        activityManager: activityManager,
                        socketConnection: socketConnection
                    }
                },
                {
                    id: 'questions',
                    title: 'Запитання лектора',
                    icon: 'fa-question-circle',
                    isActive: false,
                    controller: 'ListenerQuestionTabController',
                    templateUrl: '/public/app/modules/listener/listenerActiveLecture/tabs/listenerQuestionsTab/listenerQuestionsTab.html',
                    resolve: {
                        socketConnection: socketConnection,
                        askedQuestionsManager: askedQuestionsManager
                    }
                }
            ];

            $scope.showPresentListeners = showPresentListeners;
            $scope.quit = quit;
            $scope.onTabChanged = onTabChanged;

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
                        activityManager.addItem('Лекція призупинена');
                    });

                    showSuspendDialog();
                }),
                socketConnection.on('on_lecture_resumed', function () {

                    $rootScope.$broadcast('suspendDialog:close');

                    $timeout(function () {
                        activityManager.addItem('Лекція продовжена');
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

                    if (userId == user.id) {

                        $timeout(function () {
                            activityManager.addItem('Ви: ' + message);
                        });
                    } else {

                        usersService.getUserName(userId)
                            .then(function (user) {
                                $timeout(function () {
                                    activityManager.addItem(user.name + ': ' + message, 'info');
                                });
                            });
                    }
                }),
                socketConnection.on('on_understanding_value_updated', function (data) {

                    var understandingValue = data.understandingValue;

                    $timeout(function () {
                        pieChartModel.data[UNDERSTANDABLY_VALUE_INDEX] = round(understandingValue, 1);
                        pieChartModel.data[UNCLEAR_VALUE_INDEX] = round(100 - understandingValue, 1);
                    });
                }),
                socketConnection.on('on_question_asked', function (data) {

                    var question = data.question;

                    $timeout(function () {
                        askedQuestionsManager.addAskedQuestion(question);
                    });
                })
            ]);

            $timeout(function () {
                socketConnection.emit('joined');
            });
        }
    ]
);
