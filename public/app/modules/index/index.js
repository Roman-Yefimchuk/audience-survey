"use strict";

angular.module('index', [

    'constants'

]).controller('IndexController', [

        '$scope',
        'productName',
        'isCordovaApp',

        function ($scope, productName, isCordovaApp) {
            $scope.productName = productName;
            $scope.isCordovaApp = isCordovaApp;
        }
    ]
);
