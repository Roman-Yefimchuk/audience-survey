"use strict";

angular.module('application', [

    'ui.bootstrap',
    'ngRoute',
    'ngSanitize',
    'ngCookies'

])
    .config([

        '$routeProvider',
        '$locationProvider',
        '$httpProvider',
        '$logProvider',
        '$tooltipProvider',
        'DEBUG_MODE',

        function ($routeProvider, $locationProvider, $httpProvider, $logProvider, $tooltipProvider, debugMode) {

            var getRouteParam = function ($route, paramName) {
                var routeParams = $route.current['params'];
                return routeParams[paramName];
            };

            $tooltipProvider.options({
                placement: 'top',
                animation: true,
                popupDelay: 500,
                appendToBody: true
            });

            $logProvider.debugEnabled(debugMode);

            $httpProvider.interceptors.push('securityInterceptorService');

            $routeProvider.when('/', {
                templateUrl: '/public/views/controllers/index-view.html',
                controller: 'IndexController',
                options: {
                    title: 'Головна'
                }
            }).when('/lecturers/:lecturerId/lectures', {
                templateUrl: '/public/views/controllers/lecturer/lectures-manager-view.html',
                controller: 'LecturesManagerController',
                resolve: {
                    user: [

                        '$route',
                        'usersService',

                        function ($route, usersService) {

                            var userId = getRouteParam($route, 'lecturerId');

                            return usersService.getUser(userId);
                        }
                    ],
                    lectures: [

                        '$route',
                        'lecturesService',

                        function ($route, lecturesService) {

                            var userId = getRouteParam($route, 'lecturerId');

                            return lecturesService.getLectures(userId);
                        }
                    ],
                    activeLectures: [

                        '$route',
                        'activeLecturesService',

                        function ($route, activeLecturesService) {

                            var userId = getRouteParam($route, 'lecturerId');

                            return activeLecturesService.getActiveLectures(userId);
                        }
                    ],
                    socketEventsListener: [

                        '$route',
                        'socketConnectorService',

                        function ($route, socketConnectorService) {

                            var userId = getRouteParam($route, 'lecturerId');

                            return socketConnectorService.openConnection(userId, '/');
                        }
                    ]
                },
                options: {
                    title: 'Управління лекціями'
                }
            }).when('/lecturers/:lecturerId/lectures/active', {
                templateUrl: '/public/views/controllers/lecturer/active-lecture/active-lecture-view.html',
                controller: 'ActiveLectureController',
                options: {
                    title: 'Поточна лекція'
                }
            }).when('/lecturers/:lecturerId/lectures/:lectureId/questions/', {
                templateUrl: '/public/views/controllers/lecturer/questions-manager-view.html',
                controller: 'QuestionsManagerController',
                resolve: {
                    user: [

                        '$route',
                        'usersService',

                        function ($route, usersService) {

                            var userId = getRouteParam($route, 'lecturerId');

                            return usersService.getUser(userId);
                        }
                    ],
                    questions: [

                        '$route',
                        'questionsService',

                        function ($route, questionsService) {

                            var userId = getRouteParam($route, 'lecturerId');
                            var lectureId = getRouteParam($route, 'lectureId');

                            return questionsService.getQuestions(userId, lectureId);
                        }
                    ]
                },
                options: {
                    title: 'Управління запитаннями лекції'
                }
            }).when('/lecturers/:lecturerId/lectures/:lectureId/statistic/', {
                templateUrl: '/public/views/controllers/lecturer/statistic-view.html',
                controller: 'StatisticController',
                options: {
                    title: 'Ститистика'
                }
            }).when('/listeners/:listenerId/lectures', {
                templateUrl: '/public/views/controllers/listener/listener-view.html',
                controller: 'ListenerController',
                options: {
                    title: 'Список лекцій'
                }
            }).when('/listeners/:listenerId/lectures/:lectureId', {
                templateUrl: '/public/views/controllers/listener/listener-view.html',
                controller: 'LectureRoomController',
                options: {
                    title: 'Лекційна зала'
                }
            }).when('/sign-in', {
                templateUrl: '/public/views/controllers/sign-in-view.html',
                controller: 'SignInController',
                options: {
                    title: 'Увійти'
                }
            }).when('/sign-up', {
                templateUrl: '/public/views/controllers/sign-up-view.html',
                controller: 'SignUpController',
                options: {
                    title: 'Реєстрація'
                }
            }).otherwise({
                templateUrl: '/public/views/controllers/page-not-found-view.html',
                controller: 'NotFoundController',
                options: {
                    title: 'Сторінка не знайдена'
                }
            });
        }
    ])

    .run([

        '$rootScope',
        '$location',
        '$document',

        function ($rootScope, $location, $document) {

            $rootScope.$on('$routeChangeStart', function (event, nextRoute, currentRoute) {
            });

            $rootScope.$on('$routeChangeSuccess', function (event, currentRoute, prevRoute) {
                var options = currentRoute['options'];
                if (options) {
                    $document.attr('title', options.title);
                }
            });
        }
    ]);