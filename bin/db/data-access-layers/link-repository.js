"use strict";

(function (require) {

    var _ = require('underscore');
    var Promise = require('q')['promise'];
    var DbProvider = require('../db-provider').usePath('sql/link/');
    var DbHelper = require('./../../utils/db/db-helper');

    function createLink(lectureId, model) {

        return Promise(function (resolve, reject) {

            DbProvider.executeQuery('create-link.sql', {
                title: model.title,
                url: model.url,
                lectureId: DbHelper.parseRecordId(lectureId)
            }).then(function (results) {

                var linkIds = results[0];
                var linkId = linkIds[linkIds.length - 1];

                resolve(DbHelper.parseRecordId(linkId));
            }).catch(function (e) {
                reject(e);
            });
        });
    }

    function getLinks(lectureId) {

        return Promise(function (resolve, reject) {

            DbProvider.executeQuery('get-links.sql', {
                lectureId: DbHelper.parseRecordId(lectureId)
            }).then(function (result) {

                var links = [];

                if (result.length > 0) {

                    _.forEach(result, function (link) {
                        links.push({
                            id: DbHelper.getRecordId(link),
                            title: link.title,
                            url: link.url
                        });
                    });
                }

                resolve(links);
            }).catch(function (e) {

                reject(e);
            });
        });
    }

    function removeLink(lectureId, linkId) {

        return Promise(function (resolve, reject) {

            DbProvider.executeQuery('remove-link.sql', {
                lectureId: DbHelper.parseRecordId(lectureId),
                linkId: DbHelper.parseRecordId(linkId)
            }).then(function () {
                resolve();
            }).catch(function (e) {
                reject(e);
            });
        });
    }

    function updateLink(linkId, model) {

        return Promise(function (resolve, reject) {

            DbProvider.executeQuery('update-link.sql', {
                linkId: DbHelper.parseRecordId(linkId),
                title: model.title,
                url: model.url
            }).then(function () {
                resolve();
            }).catch(function (e) {
                reject(e);
            });
        });
    }

    module.exports = {
        createLink: createLink,
        getLinks: getLinks,
        removeLink: removeLink,
        updateLink: updateLink
    }

})(require);