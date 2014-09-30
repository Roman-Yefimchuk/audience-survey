"use strict";

(function (require) {

    var dbHelper = require('../db-helper');
    var ChartPoint = require('../models/chart-point');
    var TimeMarker = require('../models/time-marker');

    module.exports = dbHelper.createModel('StatisticChart', {
        date: {type: String},
        chartPoints: [ChartPoint['schema']],
        timeline: [TimeMarker['schema']]
    });

})(require);