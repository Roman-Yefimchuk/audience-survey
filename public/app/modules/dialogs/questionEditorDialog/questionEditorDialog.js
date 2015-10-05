"use strict";

angular.module('dialogs.questionEditorDialog', [

    'dialogs.questionEditorDialog.editorForms.choiceForm',
    'dialogs.questionEditorDialog.editorForms.defaultForm',
    'dialogs.questionEditorDialog.editorForms.rangeForm'

]).controller('QuestionEditorDialogController', [

        '$scope',
        '$modalInstance',
        'options',

        function ($scope, $modalInstance, options) {

            var onSave = options.onSave;
            var questionModel = options.questionModel;

            function save() {
                onSave(questionModel, function () {
                    $modalInstance.close();
                });
            }

            function cancel() {
                $modalInstance.dismiss('cancel');
            }

            $scope.$watch('model', function (model) {
                $scope.canSaveQuestion = !angular.equals(model, $scope.originalModel);
            }, true);

            $scope.canSaveQuestion = false;
            $scope.editorForms = {
                'default': {
                    'title': 'Звичайне запитання'
                },
                'single-choice': {
                    'title': 'Вибрати один варіант'
                },
                'multi-choice': {
                    'title': 'Вибрати декілька варіантів'
                },
                'range': {
                    'title': 'Вибрати із діапазона значеннь'
                }
            };
            $scope.model = questionModel;
            $scope.originalModel = angular.copy(questionModel);
            $scope.editorTitle = options.editorTitle;

            $scope.save = save;
            $scope.cancel = cancel;
        }
    ]
);
