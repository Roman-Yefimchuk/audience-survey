'use strict';

angular.module('application', [

    'ui.bootstrap',

    'notificationsWidget',
    'footerWidget',
    'routes',
    'constants'

]).config([

    '$logProvider',
    '$tooltipProvider',
    'debugMode',

    function ($logProvider, $tooltipProvider, debugMode) {

        $tooltipProvider.options({
            placement: 'top',
            animation: true,
            popupDelay: 500,
            appendToBody: true
        });

        $logProvider.debugEnabled(debugMode);
    }
]).run([

    'isCordovaApp',

    function (isCordovaApp) {

        if (isCordovaApp) {

            angular.injector([

                'ng',
                'services.contentLoaderService',
                'services.loaderService'

            ], true).invoke([

                '$timeout',
                'loaderService',
                'contentLoaderService',

                function ($timeout, loaderService, contentLoaderService) {

                    loaderService.showLoader();

                    $timeout(function () {

                        contentLoaderService.loadScript('/public/dynamicLibs/cordova-2.4.0.js')
                            .then(function () {

                                document.addEventListener("deviceready", function () {
                                    console.log('Device ready');
                                }, false);

                                loaderService.hideLoader();
                            });
                    });
                }
            ]);
        }
    }
]);