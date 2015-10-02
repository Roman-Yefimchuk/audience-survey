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
        'user',
        'lecture',
        'activeLecture',
        'socketConnection',

        function ($q, $scope, $filter, $location, $timeout, dialogsService, socketEventsManagerService, activeLecturesService, usersService, user, lecture, activeLecture, socketConnection) {

            var userId = user.id;
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
            var activityCollection = [];
            var tabs = [
                {
                    id: 'lecture-info',
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

            /*            function clearInput() {
             $scope.newQuestion['text'] = '';
             }

             function askQuestion(question) {

             var socketConnection = $scope.socketConnection;
             socketConnection.askQuestion(lectureId, question);

             question.answers = [];
             question.isAsked = true;

             addActivityItem('Ви задали запитання: ' + question.title);
             }*/

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

            function subscribeForSocketEvent() {

                $scope.$on('socketsService:updateChart', function (event, chartPoints) {
                    console.log(chartPoints);
                    $scope.chartModel = getChartModel(chartPoints);
                });
            }

            $scope.user = user;
            $scope.lecture = lecture;
            $scope.activeLecture = activeLecture;

            $scope.activityCollection = activityCollection;
            $scope.lectures = [];
            $scope.newQuestion = {
                text: ''
            };
            $scope.questions = [];
            $scope.pieModel = pieModel;
            $scope.chartModel = chartModel;
            $scope.tabs = tabs;
            $scope.tab = _.find(tabs, function (tab) {
                return tab.isActive;
            });

            $scope.resumeLecture = resumeLecture;
            $scope.suspendLecture = suspendLecture;
            $scope.stopLecture = stopLecture;
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

            $scope.$on('$destroy', function () {
                socketConnection.close();
            });
        }
    ]
);
