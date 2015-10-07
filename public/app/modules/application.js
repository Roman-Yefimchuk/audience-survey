'use strict';

angular.module('application', [

    'ui.bootstrap',

    'routes',
    'constants'

]).config([

    '$logProvider',
    '$tooltipProvider',
    'DEBUG_MODE',

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

    'isEmbeddedClient',

    function (isEmbeddedClient) {

        if (isEmbeddedClient) {

            angular.injector([
                'ng',
                'services.contentLoaderService',
                'services.loaderService',
                'services.logProxyService'
            ], true).invoke([

                '$timeout',
                'loaderService',
                'contentLoaderService',
                'logProxyService',

                function ($timeout, loaderService, contentLoaderService, logProxyService) {

                    loaderService.showLoader();

                    $timeout(function () {

                        contentLoaderService.loadScript('/public/dynamicLibs/cordova-2.4.0.js')
                            .then(function () {

                                document.addEventListener("deviceready", function () {
                                    logProxyService.info('Device ready');
                                }, false);

                                loaderService.hideLoader();
                            });
                    });
                }
            ]);
        }
    }
]);