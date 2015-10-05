var Timer = (function () {

    function Timer(callback, interval) {
        this.callback = _.bind(callback, this);
        this.interval = interval || 0;
        this.$$status = 'created';
    }

    Timer.prototype = {
        constructor: Timer,
        start: function (onStarted) {

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

            if (onStarted) {
                _.bind(onStarted, this)();
            }

            return timer;
        },
        suspend: function (onSuspended) {

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

            if (onSuspended) {
                _.bind(onSuspended, this)();
            }

            return timer;
        },
        resume: function (onResumed) {

            var timer = this;

            if (timer.$$status == 'suspended') {
                timer.start();
            } else {
                throw 'Timer not suspended';
            }

            if (onResumed) {
                _.bind(onResumed, this)();
            }

            return timer;
        },
        stop: function (onStopped) {

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

            if (onStopped) {
                _.bind(onStopped, this)();
            }

            return timer;
        }
    };

    return Timer;
})();