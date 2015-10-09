"use strict";

angular.module('listener.listenerActiveLecture.tabs.listenerInfoTab', [])

    .controller('ListenerInfoTabController', [

        '$scope',
        'savedState',
        'lecture',

        function ($scope, savedState, lecture) {

            $scope.lecture = lecture;
        }
    ]
);
