"use strict";

(function (require) {

    var _ = require('underscore');

    function Timer(callback, interval) {
        this.callback = callback;
        this.interval = interval || 0;
        this.$$status = 'created';
    }

    Timer.prototype = {
        constructor: Timer,
        start: function () {

            var timer = this;

            if (timer.$$status == 'stopped') {
                throw 'Timer stopped';
            }

            if (timer.$$status == 'started') {
                throw 'Timer already started';
            }

            timer.$$timeoutObject = setTimeout(function callback() {

                clearTimeout(timer.$$timeoutObject);

                timer.callback();
                timer.$$lastTickTimestamp = _.now();
                timer.$$timeoutObject = setTimeout(callback, timer.interval);
            }, timer.interval);

            timer.$$status = 'started';

            return timer;
        },
        suspend: function () {

            var timer = this;

            if (timer.$$status == 'suspended') {
                throw 'Timer already suspended';
            }

            if (timer.$$status == 'started') {
                timer.$$status = 'suspended';
                clearTimeout(timer.$$timeoutObject);
            } else {
                throw 'Timer not started';
            }

            return timer;
        },
        resume: function () {

            var timer = this;

            if (timer.$$status == 'suspended') {
                timer.start();
            } else {
                throw 'Timer not suspended';
            }

            return timer;
        },
        stop: function () {

            var timer = this;

            if (timer.$$status == 'suspended') {
                timer.$$status = 'stopped';
                return timer;
            }

            if (timer.$$status == 'started') {
                timer.$$status = 'stopped';
                clearTimeout(timer.$$timeoutObject);
            } else {
                throw 'Timer not started';
            }

            return timer;
        }
    };

    module.exports = Timer;
})(require);