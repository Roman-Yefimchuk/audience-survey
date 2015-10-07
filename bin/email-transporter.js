"use strict";

(function (require) {

    var _ = require('underscore');
    var NodeMailer = require("nodemailer");
    var SmtpTransport = require('nodemailer-smtp-transport');
    var Promise = require('q')['promise'];

    var secretQuestion = "Какой пароль?" +
        "i do not know";

    var SUPPORT_EMAIL = 'node.authentication@yandex.ru';

    var transporter = SmtpTransport({
        service: "Yandex",
        auth: {
            user: "node.authentication@yandex.ru",
            pass: "&ufs^$5hfd!@dsakDS^w212@$(%^#1bDG$#5528!!#^^t4hdbBJAS%$#nkje_+"
        }
    });
    var transport = NodeMailer.createTransport(transporter);
    var getTemplate = (function () {

        var ResourcesManager = require('./utils/resources-manager');
        var compiledCache = {};

        return function (templateName) {

            return Promise(function (resolve, reject) {

                if (compiledCache[templateName]) {

                    resolve(compiledCache[templateName]);
                } else {

                    ResourcesManager.getResourceAsStringAsync(templateName)
                        .then(function (file) {

                            var template = compiledCache[templateName] = _.template(file);
                            resolve(template);
                        }, function (e) {
                            reject(e);
                        });
                }
            });
        };

    })();

    function send(templatePath, data, templateContext) {

        return Promise(function (resolve, reject) {

            getTemplate(templatePath).then(function (template) {

                transport.sendMail({
                    from: SUPPORT_EMAIL,
                    to: data.recipient,
                    subject: data.subject,
                    html: template(templateContext)
                }, function (error, response) {

                    if (error) {
                        reject(error);
                    } else {
                        resolve(response);
                    }
                });
            });
        });
    }

    function sendFeedback(subject, senderAddress, message) {
        return send('templates/feedback-template.ejs', {
            recipient: 'yefimchuk.roman@gmail.com',
            subject: subject
        }, {
            senderAddress: senderAddress,
            message: message
        });
    }

    module.exports = {
        sendFeedback: sendFeedback
    };

})(require);