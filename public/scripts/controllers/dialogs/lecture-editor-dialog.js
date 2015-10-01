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
                author: options.author,
                description: options.description,
                additionalLinks: options.additionalLinks
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
