"use strict";

angular.module('tabHost.tabWidget', [])

    .directive('tabWidget', [

        '$q',
        '$http',
        '$compile',
        '$controller',
        '$templateCache',

        function ($q, $http, $compile, $controller, $templateCache) {

            var savedStates = {};

            return {
                require: '^tabHost',
                scope: {
                    tab: '=tabWidget'
                },
                link: function (scope, element) {

                    var tab = scope.tab;
                    var templateUrl = tab.templateUrl;

                    $q(function (resolve) {

                        var template = $templateCache.get(templateUrl);
                        if (template) {

                            resolve(template);
                        } else {

                            $http.get(templateUrl)
                                .success(function (template) {

                                    $templateCache.put(templateUrl, template);
                                    resolve(template);
                                });
                        }
                    }).then(function (template) {

                        var html = element.html(template);
                        var contents = html.contents();

                        scope = scope.$new(true);

                        if (tab.controller) {

                            $controller(tab.controller, _.extend({
                                $scope: scope,
                                savedState: savedStates[tab.id] || (savedStates[tab.id] = {})
                            }, tab.resolve || {}));
                        }

                        $compile(contents)(scope);
                    });
                }
            };
        }
    ]);