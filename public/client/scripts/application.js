"use strict";

angular.module('application', [

    'ui.bootstrap',
    'ngRoute',
    'ngSanitize',
    'ngCookies',
    'chart.donut'

])
    .config([

        '$routeProvider',
        '$locationProvider',
        '$httpProvider',
        '$logProvider',
        '$tooltipProvider',
        'DEBUG_MODE',

        function ($routeProvider, $locationProvider, $httpProvider, $logProvider, $tooltipProvider, DEBUG_MODE) {

            $tooltipProvider.options({
                placement: 'top',
                animation: true,
                popupDelay: 500,
                appendToBody: true
            });

            $logProvider.debugEnabled(DEBUG_MODE);

            $routeProvider.when('/', {
                templateUrl: '/client/views/controllers/index-view.html',
                controller: 'IndexController',
                options: {
                    title: 'Головна'
                }
            }).when('/administration', {
                templateUrl: '/client/views/controllers/administration/administration-view.html',
                controller: 'AdministrationController',
                options: {
                    title: 'Управління лекціями'
                }
            }).when('/administration/questions/:lectureId', {
                templateUrl: '/client/views/controllers/administration/questions-view.html',
                controller: 'QuestionsController',
                options: {
                    title: 'Управління запитаннями лекції'
                }
            }).when('/login', {
                templateUrl: '/client/views/controllers/login-view.html',
                controller: 'LoginController',
                options: {
                    title: 'Увійти'
                }
            }).when('/sign-up', {
                templateUrl: '/client/views/controllers/sign-up-view.html',
                controller: 'SignUpController',
                options: {
                    title: 'Реєстрація'
                }
            }).when('/lecture-room/:lectureId', {
                templateUrl: '/client/views/controllers/lecture-room-view.html',
                controller: 'LectureRoomController',
                options: {
                    title: 'Лекційна зала'
                }
            }).when('/lectures-list', {
                templateUrl: '/client/views/controllers/lectures-list-view.html',
                controller: 'LecturesListController',
                options: {
                    title: 'Список лекцій'
                }
            }).when('/logout', {
                template: '',
                controller: 'LogoutController'
            }).otherwise({
                templateUrl: '/client/views/controllers/page-not-found-view.html',
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