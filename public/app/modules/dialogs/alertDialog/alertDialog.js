"use strict";

angular.module('dialogs.alertDialog', [

    'ngSanitize'

]).controller('AlertDialogController', [

        '$scope',
        '$interpolate',
        '$modalInstance',
        'options',

        function ($scope, $interpolate, $modalInstance, options) {

            var context = options.context || {};
            var onClose = options.onClose || function (closeCallback) {
                closeCallback();
            };

            $scope.title = $interpolate(options.title)(context);
            $scope.message = $interpolate(options.message)(context);

            function ok() {
                onClose(function () {
                    $modalInstance.close();
                });
            }

            $scope.ok = ok;
        }
    ]
);
