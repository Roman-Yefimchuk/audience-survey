"use strict";

angular.module('dialogs.infoDialog', [])

    .controller('InfoDialogController', [

        '$scope',
        '$modalInstance',

        function ($scope, $modalInstance) {

            function ok() {
                $modalInstance.close();
            }

            $scope.ok = ok;
        }
    ]
);
