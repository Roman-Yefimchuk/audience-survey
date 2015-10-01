"use strict";

(function (require) {

    var _ = require('underscore');
    var Promise = require('q')['promise'];
    var DbProvider = require('../db-provider').usePath('sql/question/');
    var DbHelper = require('./../../utils/db/db-helper');

    function createQuestion(lectureId, model) {

        return Promise(function (resolve, reject) {

            DbProvider.executeQuery('create-question.sql', {
                title: model.title,
                creationDate: _.now(),
                type: model.type,
                data: JSON.stringify(model.data),
                lectureId: DbHelper.parseRecordId(lectureId)
            }).then(function (results) {

                var questionIds = results[0].value;
                var questionId = questionIds[questionIds.length - 1];

                resolve(DbHelper.parseRecordId(questionId));
            }).catch(function (e) {
                reject(e);
            });
        });
    }

    function getQuestion(questionId) {

        return Promise(function (resolve, reject) {

            DbProvider.executeQuery('get-question.sql', {
                questionId: DbHelper.parseRecordId(questionId)
            }).then(function (result) {

                if (result.length > 0) {

                    var question = result[0];

                    resolve({
                        id: DbHelper.getRecordId(question),
                        title: question.title,
                        creationDate: question.creationDate,
                        type: question.type,
                        data: JSON.parse(question.data)
                    });

                } else {
                    resolve();
                }
            }).catch(function (e) {
                reject(e);
            });
        });
    }

    function getQuestions(lectureId) {

        return Promise(function (resolve, reject) {

            DbProvider.executeQuery('get-questions.sql', {
                lectureId: DbHelper.parseRecordId(lectureId)
            }).then(function (result) {

                var questions = [];

                if (result.length > 0) {

                    _.forEach(result, function (question) {
                        questions.push({
                            id: DbHelper.getRecordId(question),
                            title: question.title,
                            creationDate: question.creationDate,
                            type: question.type,
                            data: JSON.parse(question.data)
                        });
                    });
                }

                resolve(questions);
            }).catch(function (e) {

                reject(e);
            });
        });
    }

    function removeQuestion(lectureId, questionId) {

        return Promise(function (resolve, reject) {

            DbProvider.executeQuery('remove-question.sql', {
                lectureId: DbHelper.parseRecordId(lectureId),
                questionId: DbHelper.parseRecordId(questionId)
            }).then(function () {
                resolve();
            }).catch(function (e) {
                reject(e);
            });
        });
    }

    function updateQuestion(questionId, model) {

        return Promise(function (resolve, reject) {

            DbProvider.executeQuery('update-question.sql', {
                questionId: DbHelper.parseRecordId(questionId),
                title: model.title,
                type: model.type,
                data: JSON.stringify(model.data)
            }).then(function () {
                resolve();
            }).catch(function (e) {
                reject(e);
            });
        });
    }

    module.exports = {
        createQuestion: createQuestion,
        getQuestion: getQuestion,
        getQuestions: getQuestions,
        removeQuestion: removeQuestion,
        updateQuestion: updateQuestion
    }

})(require);