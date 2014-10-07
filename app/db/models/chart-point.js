"use strict";

(function (require) {

    var dbHelper = require('../db-helper');

    module.exports = dbHelper.createModel('ChartPoint', {
        timestamp: {type: Number},
        presentListeners: {type: Number},
        understandingPercentage: {type: Number}
    });

})(require);