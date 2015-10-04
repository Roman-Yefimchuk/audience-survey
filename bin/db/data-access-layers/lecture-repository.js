"use strict";

(function (require) {

    var _ = require('underscore');
    var Promise = require('q')['promise'];
    var DbProvider = require('../db-provider').usePath('sql/lecture/');
    var DbHelper = require('./../../utils/db/db-helper');

    function createLecture(lecturerId, model) {

        return Promise(function (resolve, reject) {

            DbProvider.executeQuery('create-lecture.sql', {
                name: model.name,
                creationDate: _.now(),
                lecturerId: DbHelper.parseRecordId(lecturerId),
                description: model.description
            }).then(function (results) {

                var lecture = results[0];

                resolve({
                    id: DbHelper.getRecordId(lecture),
                    creationDate: lecture.creationDate
                });
            }).catch(function (e) {
                reject(e);
            });
        });
    }

    function getLecture(lectureId) {

        return Promise(function (resolve, reject) {

            DbProvider.executeQuery('get-lecture.sql', {
                lectureId: DbHelper.parseRecordId(lectureId)
            }).then(function (result) {

                if (result.length > 0) {

                    var lecture = result[0];

                    resolve({
                        id: DbHelper.getRecordId(lecture),
                        name: lecture.name,
                        creationDate: lecture.creationDate,
                        description: lecture.description,
                        links: JSON.parse(lecture.links),
                        lecturer: (function (user) {
                            return {
                                id: DbHelper.getRecordId(user),
                                rating: user.rating,
                                profile: (function (profile) {
                                    return {
                                        name: profile.name,
                                        email: profile.email
                                    };
                                })(user.profile)
                            };
                        })(lecture.lecturer)
                    });

                } else {
                    resolve();
                }
            }).catch(function (e) {
                reject(e);
            });
        });
    }

    function getLectures(lecturerId) {

        return Promise(function (resolve, reject) {

            DbProvider.executeQuery('get-lectures.sql', {
                lecturerId: DbHelper.parseRecordId(lecturerId)
            }).then(function (result) {

                var lectures = [];

                if (result.length > 0) {

                    _.forEach(result, function (lecture) {
                        lectures.push({
                            id: DbHelper.getRecordId(lecture),
                            name: lecture.name,
                            creationDate: lecture.creationDate,
                            description: lecture.description,
                            links: JSON.parse(lecture.links),
                            lecturer: (function (user) {
                                return {
                                    id: DbHelper.getRecordId(user),
                                    rating: user.rating,
                                    profile: (function (profile) {
                                        return {
                                            name: profile.name,
                                            email: profile.email
                                        };
                                    })(user.profile)
                                };
                            })(lecture.lecturer)
                        });
                    });
                }

                resolve(lectures);
            }).catch(function (e) {

                reject(e);
            });
        });
    }

    function removeLecture(lectureId) {

        return Promise(function (resolve, reject) {

            DbProvider.executeQuery('remove-lecture.sql', {
                lectureId: DbHelper.parseRecordId(lectureId)
            }).then(function () {
                resolve();
            }).catch(function (e) {
                reject(e);
            });
        });
    }

    function updateLecture(lectureId, model) {

        return Promise(function (resolve, reject) {

            DbProvider.executeQuery('update-lecture.sql', {
                lectureId: DbHelper.parseRecordId(lectureId),
                name: model.name,
                description: model.description,
                links: JSON.stringify(model.links)
            }).then(function () {
                resolve();
            }).catch(function (e) {
                reject(e);
            });
        });
    }

    module.exports = {
        createLecture: createLecture,
        getLecture: getLecture,
        getLectures: getLectures,
        removeLecture: removeLecture,
        updateLecture: updateLecture
    }

})(require);