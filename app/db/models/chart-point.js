"use strict";

(function (require) {

    var dbHelper = require('../db-helper');

    module.exports = dbHelper.createModel('ChartPoint', {
        timestamp: {type: Number},
        presentNumber: {type: Number},
        understandingPercentage: {type: Number},
        question: {type: String}
    });

})(require);