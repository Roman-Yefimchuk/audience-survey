"use strict";

angular.module('dialogs.answerDialog.answerForms.multiChoiceAnswerForm', [])

    .directive('multiChoiceAnswerForm', [

        function () {

            return {
                scope: {
                    data: '=multiChoiceAnswerForm',
                    options: '='
                },
                templateUrl: '/public/app/modules/dialogs/answerDialog/answerForms/multiChoiceAnswerForm/multiChoiceAnswerForm.html',
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

                        $scope.options['canSendAnswer'] = chosenItems.length > 0;
                        $scope.options['answerData'] = chosenItems;
                    }, true);
                }]
            };
        }
    ]
);
