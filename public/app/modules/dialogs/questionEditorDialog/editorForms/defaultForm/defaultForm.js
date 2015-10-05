"use strict";

angular.module('dialogs.questionEditorDialog.editorForms.defaultForm', [])

    .directive('defaultForm', [

        function () {

            return {
                scope: {
                    model: '=',
                    originalModel: '='
                },
                templateUrl: '/public/app/modules/dialogs/questionEditorDialog/editorForms/defaultForm/defaultForm.html',
                controller: ['$scope', function ($scope) {

                    var model = $scope.model;
                    var originalModel = $scope.originalModel;

                    if (originalModel.type == 'default') {
                        model.data = angular.copy(originalModel.data);
                    } else {
                        model.data = {
                            'yes': 'Так',
                            'no': 'Ні'
                        };
                    }
                }]
            };
        }
    ]
);
