"use strict";

(function (require) {

    var Promise = require('q')['promise'];
    var QueriesCache = require('../../bin/db/queries-cache');
    var DbConnector = require('../../bin/db/db-connector');

    module.exports = {
        executeQuery: function (queryFile, options) {

            return Promise(function (resolve, reject) {

                QueriesCache.getQuery(queryFile)
                    .then(function (query) {

                        DbConnector.getConnection('http')
                            .then(function (connection) {

                                connection.executeQuery(query, options)
                                    .then(function (obj) {
                                        resolve(obj);
                                    })
                                    .catch(function (e) {
                                        reject(e);
                                    });
                            })
                            .catch(function (e) {
                                reject(e);
                            });
                    })
                    .catch(function (e) {
                        reject(e);
                    });
            });
        },
        usePath: function (path) {
            var context = this;
            return {
                executeQuery: function (queryFile, options) {
                    return context.executeQuery(path + queryFile, options);
                },
                usePath: function (subPath) {
                    return context.usePath(path + subPath);
                }
            };
        }
    };

})(require);