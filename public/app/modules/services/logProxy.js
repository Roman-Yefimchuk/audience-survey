"use strict";

angular.module('services.logProxyService', [

    'constants'

]).service('logProxyService', [

        'isEmbeddedClient',

        function (isEmbeddedClient) {
            return {
                info: function (s) {

                    if (isEmbeddedClient) {
                        window['__logProxy__'].info(s);
                    } else {
                        console.info(s);
                    }
                },
                debug: function (s) {

                    if (isEmbeddedClient) {
                        window['__logProxy__'].debug(s);
                    } else {
                        console.debug(s);
                    }
                },
                error: function (s) {

                    if (isEmbeddedClient) {
                        window['__logProxy__'].error(s);
                    } else {
                        console.error(s);
                    }
                }
            };
        }
    ]
);