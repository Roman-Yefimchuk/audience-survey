"use strict";

angular.module('dialogs.questionEditorDialog.editorForms.rangeForm', [])

    .directive('rangeForm', [

        function () {

            return {
                scope: {
                    model: '=',
                    originalModel: '='
                },
                templateUrl: '/public/app/modules/dialogs/questionEditorDialog/editorForms/rangeForm/rangeForm.html',
                controller: ['$scope', function ($scope) {

                    var model = $scope.model;
                    var originalModel = $scope.originalModel;

                    if (originalModel.type == 'range') {
                        model.data = angular.copy(originalModel.data);
                    } else {
                        model.data = {
                            minValue: 0,
                            maxValue: 10
                        };
                    }
                }]
            };
        }
    ]
);
