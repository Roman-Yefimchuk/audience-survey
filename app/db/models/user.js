"use strict";

(function (require) {

    var _ = require('underscore');
    var dbHelper = require('../db-helper');

    module.exports = dbHelper.createModel('User', {
        name: {type: String},
        password: {type: String},
        role: {type: String},
        registeredDate: {type: Number, 'default': _.now},
        currentLectureId: {type: String}
    });

})(require);