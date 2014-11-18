"use strict";

angular.module('application')

    .controller('ActiveLectureController', [

        '$scope',
        '$filter',
        '$location',
        '$routeParams',
        '$timeout',
        '$interval',
        'apiService',
        'dialogsService',
        'loaderService',
        'socketsService',
        'userService',
        'SOCKET_URL',

        function ($scope, $filter, $location, $routeParams, $timeout, $interval, apiService, dialogsService, loaderService, socketsService, userService, SOCKET_URL) {

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
            var chartModel = getChartModel([]);
            var lectureId = $routeParams.lectureId;
            var activityCollection = [];
            var tabs = [
                {
                    id: 'lecture-info',
                    title: 'Інформація',
                    icon: 'fa-info-circle',
                    templateUrl: '/client/views/controllers/administration/active-lecture/tabs/info-tab-view.html',
                    isActive: false
                },
                {
                    id: 'survey',
                    title: 'Опитування',
                    icon: 'fa-pie-chart',
                    templateUrl: '/client/views/controllers/administration/active-lecture/tabs/survey-tab-view.html',
                    isActive: true
                },
                {
                    id: 'activity',
                    title: 'Активність',
                    icon: 'fa-bolt',
                    templateUrl: '/client/views/controllers/administration/active-lecture/tabs/activity-tab-view.html',
                    isActive: false
                },
                {
                    id: 'questions',
                    title: 'Запитання лектора',
                    icon: 'fa-question-circle',
                    templateUrl: '/client/views/controllers/administration/active-lecture/tabs/teacher-questions-tab-view.html',
                    isActive: false
                }
            ];

            function interval(fn, delay, count, invokeApply) {
                fn();
                return $interval(fn, delay, count, invokeApply);
            }

            function showPresentListeners() {
                dialogsService.showPresentListeners({
                    lecture: $scope.lecture
                });
            }

            function resumeLecture(lecture) {
                var socketConnection = $scope.socketConnection;
                socketConnection.resumeLecture(lecture.id);
            }

            function suspendLecture(lecture) {
                var socketConnection = $scope.socketConnection;
                socketConnection.suspendLecture(lecture.id);
            }

            function stopLecture(lecture) {
                var socketConnection = $scope.socketConnection;
                socketConnection.stopLecture(lecture.id);
            }


            function findQuestionById(questionId) {
                return _.findWhere($scope.questions, {
                    id: questionId
                });
            }

            function addQuestion() {

                var questions = $scope.questions;

                var questionTitle = $scope['newQuestion']['text'].trim();
                if (questionTitle) {
                    apiService.createQuestion(lectureId, {
                        title: questionTitle,
                        type: 'default',
                        data: {
                            yes: 'Так',
                            no: 'Ні'
                        }
                    }, {
                        success: function (response) {
                            questions.push({
                                id: response.questionId,
                                title: questionTitle,
                                type: 'default',
                                data: {
                                    yes: 'Так',
                                    no: 'Ні'
                                }
                            });
                            $scope.newQuestion['text'] = '';
                        }
                    });
                }
            }

            function editQuestion(question) {
                dialogsService.showQuestionEditor({
                    dialogTitle: 'Редагувати запитання',
                    questionModel: {
                        title: question.title,
                        type: question.type,
                        data: question.data
                    },
                    onSave: function (questionModel, closeCallback) {
                        apiService.updateQuestion(question.id, {
                            title: questionModel.title,
                            type: questionModel.type,
                            data: questionModel.data
                        }, {
                            success: function () {
                                question.title = questionModel.title;
                                question.type = questionModel.type;
                                question.data = questionModel.data;
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
                $scope.newQuestion['text'] = '';
            }

            function askQuestion(question) {

                var socketConnection = $scope.socketConnection;
                socketConnection.askQuestion(lectureId, question);

                question.answers = [];
                question.isAsked = true;

                addActivityItem('Ви задали запитання: ' + question.title);
            }

            function showAnsweredListeners(question) {
                dialogsService.showAnsweredListeners({
                    answers: question.answers
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

            function getChartModel(chartPoints) {
                return {
                    labels: (function () {
                        var labels = (function () {
                            if (chartPoints.length > 0) {
                                return ["00:00"];
                            }
                            return ["00:00", "01:00"];
                        })();
                        _.forEach(chartPoints, function (chartPoint) {
                            labels.push($filter('formatTime')(chartPoint.timestamp, '@{minutes}:@{seconds}'));
                        });
                        return labels;
                    })(),
                    datasets: [
                        {
                            fillColor: "rgba(220,220,220,0.2)",
                            strokeColor: "rgba(220,220,220,1)",
                            pointColor: "rgba(220,220,220,1)",
                            pointStrokeColor: "#fff",
                            pointHighlightFill: "#fff",
                            pointHighlightStroke: "rgba(220,220,220,1)",
                            data: (function () {
                                var data = (function () {
                                    if (chartPoints.length > 0) {
                                        return [0];
                                    }
                                    return [0, 0];
                                })();
                                _.forEach(chartPoints, function (chartPoint) {
                                    data.push(chartPoint.presentListeners);
                                });
                                return data;
                            })()
                        },
                        {
                            fillColor: "rgba(151,187,205,0.2)",
                            strokeColor: "rgba(151,187,205,1)",
                            pointColor: "rgba(151,187,205,1)",
                            pointStrokeColor: "#fff",
                            pointHighlightFill: "#fff",
                            pointHighlightStroke: "rgba(151,187,205,1)",
                            data: (function () {
                                var data = (function () {
                                    if (chartPoints.length > 0) {
                                        return [0];
                                    }
                                    return [0, 0];
                                })();
                                _.forEach(chartPoints, function (chartPoint) {
                                    data.push(((chartPoint.understandingPercentage * chartPoint.presentListeners) / 100).toFixed(2));
                                });
                                return data;
                            })()
                        }
                    ]
                };
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

                $scope.$on('socketsService:updateStatistic', function (event, data) {
                    if (data['lectureId'] == lectureId) {
                        var understandingValue = data['understandingValue'];

                        $timeout(function () {
                            pieModel[0].value = parseFloat(understandingValue).toFixed(1);
                            pieModel[1].value = (100 - parseFloat(understandingValue)).toFixed(1);
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

                $scope.$on('socketsService:updateChart', function (event, chartPoints) {
                    console.log(chartPoints);
                    $scope.chartModel = getChartModel(chartPoints);
                });

                $scope.$on('socketsService:updateQuestionInfo', function (event, data) {

                    var isAsked = data['isAsked'];
                    if (isAsked) {
                        var questionId = data['questionId'];
                        var answers = data['answers'];

                        var question = findQuestionById(questionId);
                        if (question) {
                            $timeout(function () {
                                question.isAsked = true;
                                question.answers = answers;
                            });
                        }
                    }
                });

                $scope.$on('socketsService:userDisconnected', function (event, data) {
                    var lectureId = data['lectureId'];
                    if (lectureId) {
                        var lecture = _.findWhere($scope.lectures, {
                            id: lectureId
                        });

                        if (lecture) {
                            var userId = data['userId'];
                            $timeout(function () {
                                lecture.presentListeners = _.without(lecture.presentListeners || [], userId);
                            });
                        }
                    }
                });

                $scope.$on('socketsService:lectureResumed', function (event, data) {
                    var lecture = $scope.lecture;
                    if (lecture.id == data['lectureId']) {
                        lecture.status = 'started';
                        lecture.timer = interval(function () {
                            var socketConnection = $scope.socketConnection;
                            socketConnection.getLectureDuration(lectureId);
                        }, 1000, 0, false);
                    }
                });

                $scope.$on('socketsService:lectureSuspended', function (event, data) {
                    var lecture = $scope.lecture;
                    if (lecture.id == data['lectureId']) {
                        lecture.status = 'suspended';
                        var timer = lecture.timer;
                        if (timer) {
                            $interval.cancel(timer);
                        }
                    }
                });

                $scope.$on('socketsService:lectureStopped', function (event, data) {
                    var lecture = $scope.lecture;
                    if (lecture.id == data['lectureId']) {
                        lecture.status = 'stopped';
                        var timer = lecture.timer;
                        if (timer) {
                            $interval.cancel(timer);
                        }
                        $location.path('/administration');
                    }
                });

                $scope.$on('socketsService:updateLectureDuration', function (event, data) {
                    var lecture = $scope.lecture;
                    if (lecture.id == data['lectureId']) {
                        $timeout(function () {
                            lecture.duration = data['duration'];
                        });
                    }
                });

                $scope.$on('socketsService:updateTotalLectureDuration', function (event, data) {
                    var lecture = $scope.lecture;
                    if (lecture.id == data['lectureId']) {
                        $timeout(function () {
                            lecture.totalDuration = data['totalDuration'];
                        });
                    }
                });

                $scope.$on('socketsService:updatePresentListeners', function (event, data) {
                    var lecture = $scope.lecture;
                    if (lecture.id == data['lectureId']) {
                        $timeout(function () {
                            lecture.presentListeners = data['presentListeners'];
                        });
                    }
                });

                $scope.$on('socketsService:listenerJoined', function (event, data) {
                    var userId = data['userId'];
                    var lecture = $scope.lecture;
                    if (lecture.id == data['lectureId']) {
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
                    var userId = data['userId'];
                    var lecture = $scope.lecture;
                    if (lecture.id == data['lectureId']) {
                        getUserName(userId, function (userName) {
                            $timeout(function () {
                                var presentListeners = lecture.presentListeners || [];
                                lecture.presentListeners = _.without(presentListeners, userId);
                                addActivityItem(userName + ' покинув лекцію');
                            });
                        });
                    }
                });
            }

            $scope.activityCollection = activityCollection;
            $scope.lectures = [];
            $scope.newQuestion = {
                text: ''
            };
            $scope.questions = [];
            $scope.showView = true;
            $scope.loading = false;
            $scope.pieModel = pieModel;
            $scope.chartModel = chartModel;
            $scope.tabs = tabs;
            $scope.tab = _.find(tabs, function (tab) {
                return tab.isActive;
            });

            $scope.$on('$destroy', function () {
                var timer = $scope.lecture['timer'];
                if (timer) {
                    $interval.cancel(timer);
                }
            });

            $scope.resumeLecture = resumeLecture;
            $scope.suspendLecture = suspendLecture;
            $scope.stopLecture = stopLecture;
            $scope.showPresentListeners = showPresentListeners;
            $scope.addQuestion = addQuestion;
            $scope.editQuestion = editQuestion;
            $scope.removeQuestion = removeQuestion;
            $scope.clearInput = clearInput;
            $scope.askQuestion = askQuestion;
            $scope.showAnsweredListeners = showAnsweredListeners;
            $scope.addActivityItem = addActivityItem;
            $scope.setActiveTab = setActiveTab;

            loaderService.showLoader();

            userService.getData({
                success: function (user) {

                    subscribeForSocketEvent();

                    socketsService.openCollection({
                        url: SOCKET_URL,
                        userId: user.userId
                    }, function (socketConnection) {

                        apiService.getLectureById(lectureId, {
                            success: function (response) {

                                var lecture = response.lecture;
                                $scope.lecture = lecture;

                                var id = lecture.id;

                                if (lecture.status == 'started') {
                                    lecture.duration = 0;
                                    lecture.timer = interval(function () {
                                        socketConnection.getLectureDuration(id);
                                    }, 1000, 0, false);

                                    socketConnection.updatePresentListeners(id);
                                }

                                apiService.getQuestionsByLectureId(lectureId, {
                                    success: function (response) {
                                        $timeout(function () {

                                            $scope.socketConnection = socketConnection;
                                            $scope.questions = response.questions;
                                            $scope.user = user;

                                            _.forEach($scope.questions, function (question) {
                                                socketConnection.getQuestionInfo(lectureId, question.id);
                                            });

                                            socketConnection.updateChart(id);

                                            loaderService.hideLoader();
                                        });
                                    },
                                    failure: function (error) {

                                        dialogsService.showAlert({
                                            title: 'Помилка',
                                            message: 'Список запитань не знайдено',
                                            onClose: function (closeCallback) {
                                                closeCallback();
                                            }
                                        });

                                        $scope.showView = false;
                                        loaderService.hideLoader();
                                    }
                                });
                            },
                            failure: function (error) {

                                dialogsService.showAlert({
                                    title: 'Помилка',
                                    message: 'Лекція не знайдена',
                                    onClose: function (closeCallback) {
                                        $location.path('/administration');
                                        closeCallback();
                                    }
                                });

                                $scope.showView = false;

                                loaderService.hideLoader();
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
