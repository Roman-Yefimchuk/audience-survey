"use strict";

angular.module('application')

    .controller('LectureRoomController', [

        '$scope',
        '$rootScope',
        '$location',
        '$routeParams',
        '$timeout',
        '$interval',
        'apiService',
        'loaderService',
        'socketsService',
        'userService',
        'dialogsService',
        'notificationsService',
        'SOCKET_URL',

        function ($scope, $rootScope, $location, $routeParams, $timeout, $interval, apiService, loaderService, socketsService, userService, dialogsService, notificationsService, SOCKET_URL) {

            var lectureId = $routeParams.lectureId;

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
                    templateUrl: '/client/views/controllers/lecture-room/tabs/info-tab-view.html',
                    isActive: false
                },
                {
                    id: 'survey',
                    title: 'Опитування',
                    icon: 'fa-pie-chart',
                    templateUrl: '/client/views/controllers/lecture-room/tabs/survey-tab-view.html',
                    isActive: true
                },
                {
                    id: 'activity',
                    title: 'Активність',
                    icon: 'fa-bolt',
                    templateUrl: '/client/views/controllers/lecture-room/tabs/activity-tab-view.html',
                    isActive: false
                },
                {
                    id: 'questions',
                    title: 'Запитання лектора',
                    icon: 'fa-question-circle',
                    templateUrl: '/client/views/controllers/lecture-room/tabs/teacher-questions-tab-view.html',
                    isActive: false
                }
            ];

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

            function interval(fn, delay, count, invokeApply) {
                fn();
                return $interval(fn, delay, count, invokeApply);
            }

            function getUserName(userId, callback) {
                apiService.getUserById(userId, {
                    success: function (response) {
                        var user = response.user;
                        var userName = user.name;
                        callback(userName);
                    }
                });
            }

            function subscribeForSocketEvent() {

                $scope.$on('socketsService:userDisconnected', function (event, data) {
                    if (data['lectureId'] == lectureId) {
                        var lecture = $scope.lecture;
                        var userId = data['userId'];

                        getUserName(userId, function (userName) {
                            $timeout(function () {
                                lecture.presentListeners = _.without(lecture.presentListeners || [], userId);
                                addActivityItem(userName + ' покинув лекцію');
                            });
                        });
                    }
                });

                $scope.$on('socketsService:lectureResumed', function (event, data) {
                    var lecture = $scope.lecture;

                    if (data['lectureId'] == lecture['id']) {
                        lecture.status = 'started';
                        lecture.timer = interval(function () {
                            var socketConnection = $scope.socketConnection;
                            socketConnection.getLectureDuration(lectureId);
                        }, 1000, 0, false);

                        $rootScope.$broadcast('suspendDialog:close');

                        $timeout(function () {
                            addActivityItem('Лекція продовжена');
                        });
                    }
                });

                $scope.$on('socketsService:lectureSuspended', function (event, data) {
                    var lecture = $scope.lecture;

                    if (data['lectureId'] == lecture['id']) {
                        lecture.status = 'suspended';
                        var timer = lecture.timer;
                        if (timer) {
                            $interval.cancel(timer);
                        }

                        $timeout(function () {
                            addActivityItem('Лекція призупинена');
                        });

                        dialogsService.showSuspendedDialog({
                            leaveCallback: function (closeCallback) {
                                quit();
                                closeCallback();
                            }
                        });
                    }
                });

                $scope.$on('socketsService:lectureStopped', function (event, data) {
                    var lecture = $scope.lecture;
                    if (data['lectureId'] == lecture['id']) {

                        var timer = lecture.timer;
                        if (timer) {
                            $interval.cancel(timer);
                        }

                        $rootScope.$broadcast('suspendDialog:close');

                        //TODO: quick bug fix, not good
                        if (!$scope.showDialog) {
                            $scope.showDialog = true;

                            dialogsService.showAlert({
                                title: 'Лекція закінчена',
                                message: '' +
                                    'Лекція на тему "<b>' + lecture.name + '</b>" закінчена.' +
                                    '<br>' +
                                    'Дякуємо за увагу.',
                                onClose: function (closeCallback) {
                                    $location.path('/lectures-list');
                                    closeCallback();
                                }
                            });
                        }
                    }
                });

                $scope.$on('socketsService:updateLectureDuration', function (event, data) {
                    var lecture = $scope.lecture;
                    if (data['lectureId'] == lecture.id) {
                        $timeout(function () {
                            lecture.duration = data['duration'];
                        });
                    }
                });

                $scope.$on('socketsService:questionAsked', function (event, data) {
                    var lecture = $scope.lecture;
                    if (data['lectureId'] == lecture.id) {

                        var question = data['question'];

                        teacherQuestions.push({
                            id: question.id,
                            title: question.title,
                            answer: undefined
                        });

                        $timeout(function () {
                            addActivityItem('Викладач задав питання: ' + question.title);
                        });
                    }
                });

                $scope.$on('socketsService:updatePresentListeners', function (event, data) {
                    if (data['lectureId'] == lectureId) {
                        var lecture = $scope.lecture;
                        $timeout(function () {
                            lecture.presentListeners = data['presentListeners'];
                        });
                    }
                });

                $scope.$on('socketsService:listenerJoined', function (event, data) {
                    if (data['lectureId'] == lectureId) {
                        var lecture = $scope.lecture;
                        var userId = data['userId'];

                        getUserName(userId, function (userName) {
                            $timeout(function () {
                                var presentListeners = lecture.presentListeners || [];
                                presentListeners.push(userId);
                                addActivityItem(userName + ' приєднався до лекції');
                            });
                        });
                    }
                });

                $scope.$on('socketsService:listenerHasLeft', function (event, data) {
                    if (data['lectureId'] == lectureId) {
                        var lecture = $scope.lecture;
                        var userId = data['userId'];

                        getUserName(userId, function (userName) {
                            $timeout(function () {
                                var presentListeners = lecture.presentListeners || [];
                                lecture.presentListeners = _.without(presentListeners, userId);
                                addActivityItem(userName + ' покинув лекцію');
                            });
                        });
                    }
                });

                $scope.$on('socketsService:onMessage', function (event, data) {

                    var userId = data['userId'];
                    var message = data['message'];

                    getUserName(userId, function (userName) {
                        $timeout(function () {
                            addActivityItem(userName + ': ' + message);
                        });
                    });
                });

                $scope.$on('socketsService:updateStatistic', function (event, data) {
                    if (data['lectureId'] == lectureId) {
                        var understandingValue = data['understandingValue'];

                        $timeout(function () {
                            pieModel[0].value = parseFloat(understandingValue).toFixed(1);
                            pieModel[1].value = (100 - parseFloat(understandingValue)).toFixed(1);
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
                dialogsService.showPresentListeners({
                    lecture: $scope.lecture
                });
            }

            function quit() {
                dialogsService.showConfirmation({
                    title: "Вихід",
                    message: "Ви дійсно хочете покинути лекцію?",
                    onAccept: function (closeCallback) {
                        closeCallback();
                        $location.path('/lectures-list');
                    }
                });
            }

            $scope.$on('$destroy', function () {

                var socketConnection = $scope.socketConnection;
                socketConnection.leftFromLecture(lectureId);

                var timer = $scope.lecture['timer'];
                if (timer) {
                    $interval.cancel(timer);
                }

                $rootScope.$broadcast('suspendDialog:close');
            });

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

            loaderService.showLoader();

            userService.getData({
                success: function (user) {

                    apiService.getLectureById(lectureId, {
                        success: function (response) {

                            $scope.$on('socketsService:error', function (event, error) {
                                $scope.errorMessage = 'Проблема з сокетом';
                                loaderService.hideLoader();
                            });

                            subscribeForSocketEvent();

                            socketsService.openCollection({
                                url: SOCKET_URL,
                                userId: user.userId
                            }, function (socketConnection) {

                                socketConnection.joinToLecture(lectureId);

                                $timeout(function () {

                                    var lecture = response.lecture;

                                    $scope.socketConnection = socketConnection;
                                    $scope.lecture = lecture;
                                    $scope.user = user;

                                    var id = lecture.id;

                                    switch (lecture.status) {
                                        case 'suspended':
                                        {
                                            lecture.duration = 0;

                                            socketConnection.getLectureDuration(id);
                                            socketConnection.updatePresentListeners(id);
                                            dialogsService.showSuspendedDialog({
                                                leaveCallback: function (closeCallback) {
                                                    quit();
                                                    closeCallback();
                                                }
                                            });
                                            break;
                                        }
                                        case 'started':
                                        {
                                            lecture.duration = 0;
                                            lecture.timer = interval(function () {
                                                socketConnection.getLectureDuration(id);
                                            }, 1000, 0, false);

                                            socketConnection.updatePresentListeners(id);
                                            break;
                                        }
                                        default :
                                        {
                                            dialogsService.showAlert({
                                                title: 'Лекція закінчена',
                                                message: 'Лекція на тему "<b>' + lecture.name + '"</b> закінчена',
                                                onClose: function (closeCallback) {
                                                    quit();
                                                    closeCallback();
                                                }
                                            });
                                            break;
                                        }
                                    }

                                    addActivityItem('Ви приєдналися до лекції');

                                    $scope.showView = lecture.status != 'stopped';
                                    loaderService.hideLoader();
                                });
                            });
                        },
                        failure: function (error) {

                            dialogsService.showAlert({
                                title: 'Помилка',
                                message: 'Лекція не знайдена',
                                onClose: function (closeCallback) {
                                    quit();
                                    closeCallback();
                                }
                            });

                            $scope.showView = false;
                            loaderService.hideLoader();
                        }
                    });
                },
                failure: function (error) {
                    $location.path('/');
                    loaderService.hideLoader();
                }
            });
        }
    ]
);
