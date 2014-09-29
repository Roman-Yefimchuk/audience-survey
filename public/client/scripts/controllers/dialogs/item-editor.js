"use strict";

angular.module('application')

    .controller('ItemEditorController', [

        '$scope',
        '$modalInstance',
        'options',

        function ($scope, $modalInstance, options) {

            var onUpdate = options.onUpdate;

            var itemTitle = options.itemTitle;
            var model = {
                title: itemTitle
            };

            function canSaveItem() {
                return !!model.title;
            }

            function save() {

                if (canSaveItem()) {
                    var itemTitle = model['title'].trim();

                    if (itemTitle.length > 0) {

                        onUpdate(itemTitle, function () {
                            $modalInstance.close();
                        });
                    }
                }
            }

            function cancel() {
                $modalInstance.dismiss('cancel');
            }

            $scope.model = model;
            $scope.dialogTitle = options.dialogTitle;

            $scope.canSaveItem = canSaveItem;
            $scope.save = save;
            $scope.cancel = cancel;
        }
    ]
);
