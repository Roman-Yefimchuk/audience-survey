"use strict";

angular.module('answerForms.editableForms.editableMultiChoiceAnswerForm', [])

    .directive('editableMultiChoiceAnswerForm', [

        function () {

            return {
                scope: {
                    data: '=editableMultiChoiceAnswerForm',
                    options: '='
                },
                templateUrl: '/public/app/modules/answerForms/editableForms/editableMultiChoiceAnswerForm/editableMultiChoiceAnswerForm.html',
                controller: ['$scope', function ($scope) {

                    $scope.items = (function () {
                        var items = [];
                        _.forEach($scope.data, function (text) {
                            items.push({
                                text: text,
                                isChosen: false
                            });
                        });
                        return items;
                    })();

                    $scope.$watch('items', function (items) {

                        var chosenItems = [];

                        _.forEach(items, function (item, index) {
                            if (item.isChosen) {
                                chosenItems.push(index);
                            }
                        });

                        $scope.options['isAnswerChosen'] = chosenItems.length > 0;
                        $scope.options['answerData'] = chosenItems;
                    }, true);
                }]
            };
        }
    ]
);
