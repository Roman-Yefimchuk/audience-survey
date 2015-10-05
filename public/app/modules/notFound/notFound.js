"use strict";

angular.module('pageNotFound', [])

    .controller('NotFoundController', [

        '$scope',
        '$location',

        function ($scope, $location) {
            $scope.requestUrl = $location.path();
        }
    ]
);
