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
]);