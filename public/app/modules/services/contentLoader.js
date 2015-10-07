'use strict';

angular.module('services.contentLoaderService', [])

    .service('contentLoaderService', [

        '$q',

        function ($q) {

            function loadStyle(href) {

                return $q(function (resolve) {
                    (function (link, documentElement) {

                        link.type = "text/css";
                        link.rel = "stylesheet";
                        link.href = href;
                        link.onload = link.onreadystatechange = function () {
                            if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
                                resolve();
                            }
                        };

                        documentElement.appendChild(link);

                    })(document.createElement('link'), document.documentElement);
                });
            }

            function loadScript(src) {

                return $q(function (resolve) {

                    (function (script, documentElement) {

                        script.type = 'application/javascript';
                        script.language = 'JavaScript';
                        script.src = src;
                        script.onload = script.onreadystatechange = function () {
                            if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
                                resolve();
                            }
                        };

                        documentElement.appendChild(script);

                    })(document.createElement('script'), document.documentElement);
                });
            }

            return  {
                loadStyle: loadStyle,
                loadScript: loadScript
            }
        }
    ]);
