"use strict";

(function (require) {

    var _ = require('underscore');
    var Promise = require('q')['promise'];
    var DbProvider = require('../db-provider').usePath('sql/statistic-chart/');
    var DbHelper = require('./../../utils/db/db-helper');

    function createStatisticChart(lectureId, model) {

        return Promise(function (resolve, reject) {

            DbProvider.executeQuery('create-statistic-chart.sql', {
                chartPoints: JSON.stringify(model.chartPoints),
                timeline: JSON.stringify(model.timeline),
                startTime: model.startTime,
                finishTime: model.finishTime,
                lectureId: DbHelper.parseRecordId(lectureId)
            }).then(function (results) {

                var statisticChartIds = results[0].value;
                var statisticChartId = statisticChartIds[statisticChartIds.length - 1];

                resolve(DbHelper.parseRecordId(statisticChartId));
            }).catch(function (e) {
                reject(e);
            });
        });
    }

    function getStatisticChart(statisticChartId) {

        return Promise(function (resolve, reject) {

            DbProvider.executeQuery('get-statistic-chart.sql', {
                statisticChartId: DbHelper.parseRecordId(statisticChartId)
            }).then(function (result) {

                if (result.length > 0) {

                    var statisticChart = result[0];

                    resolve({
                        id: DbHelper.getRecordId(statisticChart),
                        chartPoints: JSON.parse(statisticChart.chartPoints),
                        timeline: JSON.parse(statisticChart.timeline),
                        startTime: statisticChart.startTime,
                        finishTime: statisticChart.finishTime
                    });

                } else {
                    resolve();
                }
            }).catch(function (e) {
                reject(e);
            });
        });
    }

    function getStatisticCharts(lectureId) {

        return Promise(function (resolve, reject) {

            DbProvider.executeQuery('get-statistic-charts.sql', {
                lectureId: DbHelper.parseRecordId(lectureId)
            }).then(function (result) {

                var statisticCharts = [];

                if (result.length > 0) {

                    _.forEach(result, function (statisticChart) {
                        statisticCharts.push({
                            id: DbHelper.getRecordId(statisticChart),
                            chartPoints: JSON.parse(statisticChart.chartPoints),
                            timeline: JSON.parse(statisticChart.timeline),
                            startTime: statisticChart.startTime,
                            finishTime: statisticChart.finishTime
                        });
                    });
                }

                resolve(statisticCharts);
            }).catch(function (e) {

                reject(e);
            });
        });
    }

    module.exports = {
        createStatisticChart: createStatisticChart,
        getStatisticChart: getStatisticChart,
        getStatisticCharts: getStatisticCharts
    }

})(require);