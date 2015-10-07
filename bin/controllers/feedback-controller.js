"use strict";

(function (require) {

    var EmailTransporter = require('./../email-transporter');
    var ControllerUtils = require('./../utils/controller-utils');

    function model() {
        return new ControllerUtils.RequestResolver('body');
    }

    module.exports = function (controller) {
        return controller({
            routePrefix: 'sendFeedback',
            actions: [
                {
                    method: 'post',
                    params: [model()],
                    handler: function (model) {

                        var subject = model.subject;
                        var senderAddress = model.senderAddress;
                        var message = model.message;

                        return EmailTransporter.sendFeedback(subject, senderAddress, message);
                    }
                }
            ]
        });
    };

})(require);