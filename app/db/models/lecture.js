"use strict";

(function (require) {

    var dbHelper = require('../db-helper');
    var StatisticChart = require('../models/statistic-chart');

    module.exports = dbHelper.createModel('Lecture', {
        name: {type: String},
        authorId: {type: String},
        author: {type: String},
        description: {type: String},
        statisticCharts: [StatisticChart['schema']],
        status: {type: String, 'default': 'stopped'}
    });

})(require);