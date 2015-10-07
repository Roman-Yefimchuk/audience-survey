"use strict";

(function (require) {

    var Q = require('q');
    var Promise = Q['promise'];

    var StatisticChartRepository = require('./../db/data-access-layers/statistic-chart-repository');
    var RequestFilter = require('./../request-filter');

    module.exports = function (controller) {
        return controller({
            routePrefix: 'users/:userId/lectures/:lectureId/statisticCharts',
            actions: [
                {
                    route: '',
                    method: 'get',
                    params: ['lectureId'],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId'),
                        RequestFilter.checkRole(['lecturer'])
                    ],
                    handler: function (lectureId) {

                        return Promise(function (resolve, reject) {

                            StatisticChartRepository.getStatisticCharts(lectureId)
                                .then(function (statisticCharts) {
                                    resolve(statisticCharts)
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                },
                {
                    route: ':questionId',
                    method: 'get',
                    params: ['questionId'],
                    filters: [
                        RequestFilter.checkAuthorization(),
                        RequestFilter.checkOwnerAccess('userId'),
                        RequestFilter.checkRole(['lecturer'])
                    ],
                    handler: function (statisticChartId) {

                        return Promise(function (resolve, reject) {

                            StatisticChartRepository.getStatisticChart(statisticChartId)
                                .then(function (statisticChart) {
                                    resolve(statisticChart);
                                }, function (e) {
                                    reject(e);
                                });
                        });
                    }
                }
            ]
        });
    };

})(require);