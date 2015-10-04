"use strict";

angular.module('application')

    .controller('MultiChoiceAnswerFormController', [

        '$scope',

        function ($scope) {

            $scope.data = $scope.question['data'];
            $scope.items = (function () {
                var items = [];
                _.forEach($scope.question['data'], function (text) {
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
        }
    ]
);
