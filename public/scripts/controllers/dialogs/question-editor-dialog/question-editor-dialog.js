"use strict";

angular.module('application')

    .controller('QuestionEditorDialogController', [

        '$scope',
        '$modalInstance',
        'options',

        function ($scope, $modalInstance, options) {

            var editorForms = {
                'default': {
                    'title': 'Звичайне запитання',
                    'substrateView': '/public/views/controllers/dialogs/question-editor/editor-forms/default/' +
                        'substrate-view.html'
                },
                'single-choice': {
                    'title': 'Вибрати один варіант',
                    'substrateView': '/public/views/controllers/dialogs/question-editor/editor-forms/choice/' +
                        'substrate-view.html'
                },
                'multi-choice': {
                    'title': 'Вибрати декілька варіантів',
                    'substrateView': '/public/views/controllers/dialogs/question-editor/editor-forms/choice/' +
                        'substrate-view.html'
                },
                'range': {
                    'title': 'Вибрати із діапазона значеннь',
                    'substrateView': '/public/views/controllers/dialogs/question-editor/editor-forms/range/' +
                        'substrate-view.html'
                }
            };

            var onSave = options.onSave;
            var questionModel = options.questionModel;

            function getSubstrateView() {
                return editorForms[$scope.model['type']].substrateView;
            }

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
            $scope.editorForms = editorForms;
            $scope.model = questionModel;
            $scope.originalModel = angular.copy(questionModel);
            $scope.editorTitle = options.editorTitle;

            $scope.getSubstrateView = getSubstrateView;
            $scope.save = save;
            $scope.cancel = cancel;
        }
    ]
);
