"use strict";

angular.module('application')

    .controller('ChoiceFormController', [

        '$scope',

        function ($scope) {

            var model = $scope.model;
            var originalModel = $scope.originalModel;

            if (originalModel.type == 'single-choice' || originalModel.type == 'multi-choice') {
                model.data = angular.copy(originalModel.data);
            } else {
                model.data = [];
            }

            function addCaseItem() {

                var newCaseItem = ($scope.newCaseItem).trim();
                if (newCaseItem.length > 0) {

                    var data = model.data;
                    var caseItemPointers = $scope.caseItemPointers;

                    data.push(newCaseItem);
                    caseItemPointers.push({
                        text: newCaseItem,
                        editingText: '',
                        editing: false
                    });

                    $scope.newCaseItem = '';
                }
            }

            function editCaseItem(caseItemPointer) {
                caseItemPointer.editingText = caseItemPointer.text;
                caseItemPointer.editing = true;
            }

            function updateCaseItem(caseItemPointer) {

                caseItemPointer.text = caseItemPointer.editingText;
                caseItemPointer.editingText = '';
                caseItemPointer.editing = false;

                var index = _.indexOf($scope.caseItemPointers, caseItemPointer);

                model.data[index] = caseItemPointer.text;
            }

            function restoreCaseItem(caseItemPointer) {
                caseItemPointer.editingText = '';
                caseItemPointer.editing = false;
            }

            function removeCaseItem(caseItemPointer) {

                var index = _.indexOf($scope.caseItemPointers, caseItemPointer);

                $scope.caseItemPointers = _.without($scope.caseItemPointers, caseItemPointer);
                model.data = _.without(model.data, model.data[index]);
            }

            $scope.newCaseItem = '';
            $scope.caseItemPointers = [];

            $scope.addCaseItem = addCaseItem;
            $scope.editCaseItem = editCaseItem;
            $scope.updateCaseItem = updateCaseItem;
            $scope.restoreCaseItem = restoreCaseItem;
            $scope.removeCaseItem = removeCaseItem;

            _.forEach(model.data, function (text) {
                var caseItemPointers = $scope.caseItemPointers;
                caseItemPointers.push({
                    text: text,
                    editingText: '',
                    editing: false
                });
            });
        }
    ]
);
