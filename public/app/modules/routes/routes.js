'use strict';

angular.module('routes', [

    'ngRoute',
    'services.api.authService',
    'services.api.usersService',
    'services.api.lecturesService',
    'services.api.activeLecturesService',
    'services.api.statisticChartsService',
    'services.api.questionsService',
    'services.socketConnectorService',
    'services.loaderService',
    'index',
    'lecturer.lecturesManager',
    'lecturer.lecturerActiveLecture',
    'lecturer.lectureStatistic',
    'lecturer.questionsManager',
    'listener.activeLectures',
    'listener.listenerActiveLecture',
    'signIn',
    'signUp',
    'pageNotFound'

]).config([

    '$routeProvider',

    function ($routeProvider) {

        var getRouteParam = function ($route, paramName) {
            var routeParams = $route.current['params'];
            return routeParams[paramName];
        };

        $routeProvider.when('/', {
            templateUrl: '/public/app/modules/index/index.html',
            controller: 'IndexController',
            resolve: {
                quickSignIn: [

                    '$q',
                    '$location',
                    'authService',

                    function ($q, $location, authService) {

                        return $q(function (resolve) {

                            authService.quickSignIn()
                                .then(function (redirect) {
                                    redirect($location);
                                    resolve();
                                }, function () {
                                    resolve();
                                });
                        });
                    }
                ]
            },
            options: {
                title: 'Головна'
            }
        }).when('/lecturers/:lecturerId/lectures', {
            templateUrl: '/public/app/modules/lecturer/lecturesManager/lecturesManager.html',
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

                        return activeLecturesService.getLecturerActiveLectures(userId);
                    }
                ],
                socketConnection: [

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
        }).when('/lecturers/:lecturerId/activeLectures/:lectureId', {
            templateUrl: '/public/app/modules/lecturer/lecturerActiveLecture/lecturerActiveLecture.html',
            controller: 'LecturerActiveLectureController',
            resolve: {
                user: [

                    '$route',
                    'usersService',

                    function ($route, usersService) {

                        var userId = getRouteParam($route, 'lecturerId');

                        return usersService.getUser(userId);
                    }
                ],
                lecture: [

                    '$route',
                    'lecturesService',

                    function ($route, lecturesService) {

                        var userId = getRouteParam($route, 'lecturerId');
                        var lectureId = getRouteParam($route, 'lectureId');

                        return lecturesService.getLecture(userId, lectureId);
                    }
                ],
                activeLecture: [

                    '$route',
                    'activeLecturesService',

                    function ($route, activeLecturesService) {

                        var userId = getRouteParam($route, 'lecturerId');
                        var lectureId = getRouteParam($route, 'lectureId');

                        return activeLecturesService.getLecturerActiveLecture(userId, lectureId);
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
                ],
                socketConnection: [

                    '$route',
                    'socketConnectorService',

                    function ($route, socketConnectorService) {

                        var userId = getRouteParam($route, 'lecturerId');
                        var lectureId = getRouteParam($route, 'lectureId');

                        return socketConnectorService.openConnection(userId, '/lectures/' + lectureId);
                    }
                ]
            },
            options: {
                title: 'Поточна лекція'
            }
        }).when('/lecturers/:lecturerId/lectures/:lectureId/questions/', {
            templateUrl: '/public/app/modules/lecturer/questionsManager/questionsManager.html',
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
            templateUrl: '/public/app/modules/lecturer/lectureStatistic/lectureStatistic.html',
            controller: 'LectureStatisticController',
            resolve: {
                user: [

                    '$route',
                    'usersService',

                    function ($route, usersService) {

                        var userId = getRouteParam($route, 'lecturerId');

                        return usersService.getUser(userId);
                    }
                ],
                statisticCharts: [

                    '$route',
                    'statisticChartsService',

                    function ($route, statisticChartsService) {

                        var userId = getRouteParam($route, 'lecturerId');
                        var lectureId = getRouteParam($route, 'lectureId');

                        return statisticChartsService.getStatisticCharts(userId, lectureId);
                    }
                ]
            },
            options: {
                title: 'Ститистика'
            }
        }).when('/listeners/:listenerId/activeLectures', {
            templateUrl: '/public/app/modules/listener/activeLectures/activeLectures.html',
            controller: 'ActiveLecturesController',
            resolve: {
                user: [

                    '$route',
                    'usersService',

                    function ($route, usersService) {

                        var userId = getRouteParam($route, 'listenerId');

                        return usersService.getUser(userId);
                    }
                ],
                activeLectures: [

                    '$route',
                    'activeLecturesService',

                    function ($route, activeLecturesService) {

                        var userId = getRouteParam($route, 'listenerId');

                        return activeLecturesService.getListenerActiveLectures(userId);
                    }
                ],
                socketConnection: [

                    '$route',
                    'socketConnectorService',

                    function ($route, socketConnectorService) {

                        var userId = getRouteParam($route, 'listenerId');

                        return socketConnectorService.openConnection(userId, '/');
                    }
                ]
            },
            options: {
                title: 'Список активних лекцій'
            }
        }).when('/listeners/:listenerId/activeLectures/:lectureId', {
            templateUrl: '/public/app/modules/listener/listenerActiveLecture/listenerActiveLecture.html',
            controller: 'ListenerActiveLectureController',
            resolve: {
                user: [

                    '$route',
                    'usersService',

                    function ($route, usersService) {

                        var userId = getRouteParam($route, 'listenerId');

                        return usersService.getUser(userId);
                    }
                ],
                lecture: [

                    '$route',
                    'lecturesService',

                    function ($route, lecturesService) {

                        var userId = getRouteParam($route, 'listenerId');
                        var lectureId = getRouteParam($route, 'lectureId');

                        return lecturesService.getLecture(userId, lectureId);
                    }
                ],
                activeLecture: [

                    '$route',
                    'activeLecturesService',

                    function ($route, activeLecturesService) {

                        var userId = getRouteParam($route, 'listenerId');
                        var lectureId = getRouteParam($route, 'lectureId');

                        return activeLecturesService.getListenerActiveLecture(userId, lectureId);
                    }
                ],
                socketConnection: [

                    '$route',
                    'socketConnectorService',

                    function ($route, socketConnectorService) {

                        var userId = getRouteParam($route, 'listenerId');
                        var lectureId = getRouteParam($route, 'lectureId');

                        return socketConnectorService.openConnection(userId, '/lectures/' + lectureId);
                    }
                ]
            },
            options: {
                title: 'Лекційна зала'
            }
        }).when('/sign-in', {
            templateUrl: '/public/app/modules/signIn/signIn.html',
            controller: 'SignInController',
            options: {
                title: 'Увійти'
            }
        }).when('/sign-up', {
            templateUrl: '/public/app/modules/signUp/signUp.html',
            controller: 'SignUpController',
            options: {
                title: 'Реєстрація'
            }
        }).otherwise({
            templateUrl: '/public/app/modules/notFound/notFound.html',
            controller: 'NotFoundController',
            options: {
                title: 'Сторінка не знайдена'
            }
        });
    }
]).run([

    '$rootScope',
    '$location',
    '$document',
    'loaderService',

    function ($rootScope, $location, $document, loaderService) {

        $rootScope.$on('$routeChangeStart', function () {

            var showLoader = false;
            var timeoutId = setTimeout(function () {
                loaderService.showLoader();
                showLoader = true;
            });

            var hideLoader = function () {

                clearTimeout(timeoutId);
                onRouteChangeSuccess();
                onRouteChangeError();

                if (showLoader) {
                    loaderService.hideLoader();
                }
            };

            var onRouteChangeSuccess = $rootScope.$on('$routeChangeSuccess', hideLoader);
            var onRouteChangeError = $rootScope.$on('$routeChangeError', hideLoader);
        });

        $rootScope.$on('$routeChangeSuccess', function (event, currentRoute, prevRoute) {
            var options = currentRoute['options'];
            if (options) {
                $document.attr('title', options.title);
            }
        });
    }
]);