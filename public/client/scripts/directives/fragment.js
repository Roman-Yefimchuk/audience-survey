"use strict";

angular.module('application')

    .directive('fragment', [

        '$controller',
        '$http',
        '$templateCache',
        '$compile',

        function ($controller, $http, $templateCache, $compile) {

            function compileTemplate(scope, element, template) {
                var html = element.html(template);
                var contents = html.contents();
                $compile(contents)(scope);
            }

            function initController(scope, controller, paramsList) {
                if (controller) {

                    var $scope = scope;

                    if (paramsList.length > 0) {

                        $scope = scope.$new();

                        angular.forEach(paramsList, function (paramName) {

                            $scope[paramName] = scope[paramName];

/*                            scope.$watch(paramName, function (value) {
                                if (value != scope[paramName]) {
                                    $scope[paramName] = value;
                                }
                            }, true);*/
                        });
                    }

                    $controller(controller, {
                        $scope: $scope
                    });

                    return $scope;
                }
            }

            return {
                link: function (scope, element, attrs) {

                    var params = attrs['fragment'];
                    var paramsList = [];

                    if (params.length > 0) {
                        paramsList = params.split(',');
                    }

                    var templateUrl = attrs['templateUrl'];
                    var controller = attrs['controller'];

                    if (templateUrl) {
                        var template = $templateCache.get(templateUrl);
                        if (template) {

                            var $scope = initController(scope, controller, paramsList);
                            compileTemplate($scope, element, template);
                        } else {
                            var request = $http.get(templateUrl);
                            request.success(function (template) {
                                $templateCache.put(templateUrl, template);

                                var $scope = initController(scope, controller, paramsList);
                                compileTemplate($scope, element, template);
                            });
                        }
                    } else {
                        initController(scope, controller, paramsList);
                    }
                }
            };
        }
    ]
);