"use strict";

(function (require) {

    var mongoose = require('mongoose');
    var dbConfig = require('../../config/db-config');

    module.exports = {
        connect: function (callback, developmentMode) {
            mongoose.connect(dbConfig['url']);

            var db = mongoose['connection'];

            db.on('error', function (error) {
                console.log('connection error: ' + error.message);
            });

            db.once('open', function () {
                console.log("Connected to DB!");

                var dbProvider = require('./db-provider')(developmentMode);

                var users = dbConfig.users;

                if (users.length) {

                    var asyncEach = require('../utils/async-each');
                    var security = require('../utils/security');

                    var UserModel = require('../db/models/user');

                    asyncEach(users, function (user, index, next) {

                        UserModel.findOne({
                            name: user.name
                        }, function (error, model) {
                            if (model) {
                                next();
                            } else {

                                var name = user.name;
                                var password = user.password;
                                var role = user.role;

                                model = new UserModel({
                                    name: name,
                                    password: security.generateHash(password),
                                    role: role
                                });

                                model.save(function (error, model) {
                                    next()
                                });
                            }
                        });
                    }, function () {
                        callback(dbProvider);
                    });
                } else {
                    callback(dbProvider);
                }
            });
        }
    };

})(require);