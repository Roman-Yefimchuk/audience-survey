"use strict";

angular.module('application')

    .controller('StatisticController', [

        '$scope',
        '$routeParams',
        'loaderService',
        'apiService',

        function ($scope, $routeParams, loaderService, apiService) {

            var lectureId = $routeParams.lectureId;

            $scope.loading = false;
            $scope.statisticCollection = [];

            loaderService.showLoader();

            apiService.getLectureStatisticById(lectureId, {
                success: function (response) {
                    $scope.statisticCollection = response;
                    loaderService.hideLoader();

                    console.log(response);
                },
                failure: function (error) {
                    console.log(error);
                }
            });
        }
    ]
);
