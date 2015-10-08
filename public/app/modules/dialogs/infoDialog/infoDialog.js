"use strict";

angular.module('dialogs.infoDialog', [

    'constants'

]).controller('InfoDialogController', [

        '$scope',
        '$modalInstance',
        'productName',
        'productVersion',

        function ($scope, $modalInstance, productName, productVersion) {

            function ok() {
                $modalInstance.close();
            }

            $scope.productName = productName;
            $scope.productVersion = productVersion;

            $scope.ok = ok;
        }
    ]
);
