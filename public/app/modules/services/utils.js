'use strict';

angular.module('services.utils', [])

    .service('utilsService', [
        '$sce',

        function ($sce) {
            function getTrustHtmlContent(html, skipUnescape) {
                if (!skipUnescape) {
                    html = _.unescape(html);
                }
                return $sce.trustAsHtml(html);
            }
            return {
                getTrustHtmlContent: getTrustHtmlContent
            };
        }
    ]
);