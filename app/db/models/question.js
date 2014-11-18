"use strict";

(function (require) {

    var _ = require('underscore');
    var dbHelper = require('../db-helper');

    module.exports = dbHelper.createModel('Question', {
        title: {type: String},
        lectureId: {type: String},
        creationDate: {type: Number, 'default': _.now},
        type: {type: String},
        data: {type: String}
    });

})(require);