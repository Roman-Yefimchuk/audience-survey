"use strict";

angular.module('services.api.statisticChartsService', [

    'services.httpClientService'

]).service('statisticChartsService', [

        'httpClientService',

        function (httpClientService) {

            function getStatisticChart(userId, lectureId, statisticChartId) {
                return httpClientService.get('users/' + userId + '/lectures/' + lectureId + '/statisticCharts/' + statisticChartId);
            }

            function getStatisticCharts(userId, lectureId) {
                return httpClientService.get('users/' + userId + '/lectures/' + lectureId + '/statisticCharts');
            }

            return {
                getStatisticChart: getStatisticChart,
                getStatisticCharts: getStatisticCharts
            };
        }
    ]
);