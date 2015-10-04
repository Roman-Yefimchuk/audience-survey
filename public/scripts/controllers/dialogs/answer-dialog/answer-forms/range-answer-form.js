"use strict";

angular.module('application')

    .controller('RangeAnswerFormController', [

        '$scope',

        function ($scope) {

            $scope.data = $scope.question['data'];
            $scope.range = parseInt(($scope.data['maxValue'] - $scope.data['minValue']) / 2) + $scope.data['minValue'];

            $scope.$watch('range', function (range) {
                $scope.options['answerData'] = range;
            });

            $scope.options['canSendAnswer'] = true;
        }
    ]
);
