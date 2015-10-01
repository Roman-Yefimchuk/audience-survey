"use strict";

(function (require) {

    var ResourcesManager = require('./../utils/resources-manager');
    var Q = require('q');
    var Promise = Q['promise'];

    var cache = {};

    module.exports = {
        getQuery: function (name) {

            if (cache[name]) {
                return Q.when(cache[name]);
            }

            return Promise(function (resolve, reject) {

                ResourcesManager.getResourceAsStringAsync(name)
                    .then(function (query) {
                        cache[name] = query;
                        resolve(query);
                    })
                    .catch(function (e) {
                        reject(e);
                    });
            });
        },
        usePath: function (path) {
            var context = this;
            return {
                getQuery: function (name) {
                    return context.getQuery(path + name);
                },
                usePath: function (subPath) {
                    return context.usePath(path + subPath);
                }
            }
        }
    };

})(require);