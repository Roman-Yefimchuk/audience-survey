"use strict";

angular.module('listener.listenerActiveLecture.tabs.listenerSurveyTab', [])

    .controller('ListenerSurveyTabController', [

        '$scope',
        'savedState',
        'pieChartModel',
        'socketConnection',

        function ($scope, savedState, pieChartModel, socketConnection) {

            var CLEAR_VALUE = 1;
            var UNCLEAR_VALUE = 0;

            function clear() {
                socketConnection.emit('update_understanding_value', {
                    value: CLEAR_VALUE
                });
            }

            function unclear() {
                socketConnection.emit('update_understanding_value', {
                    value: UNCLEAR_VALUE
                });
            }

            $scope.pieChartModel = pieChartModel;

            $scope.clear = clear;
            $scope.unclear = unclear;
        }
    ]
);
