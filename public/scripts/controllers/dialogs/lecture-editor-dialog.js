"use strict";

angular.module('application')

    .controller('LectureEditorDialogController', [

        '$scope',
        '$modalInstance',
        'options',

        function ($scope, $modalInstance, options) {

            var onSave = options.onSave || function (model, closeCallback) {
                closeCallback();
            };

            var model = {
                name: options.name,
                description: options.description,
                links: options.links
            };

            function send() {
                onSave(model, function () {
                    $modalInstance.close();
                });
            }

            function cancel() {
                $modalInstance.close();
            }

            $scope.model = model;

            $scope.send = send;
            $scope.cancel = cancel;
        }
    ]
);
