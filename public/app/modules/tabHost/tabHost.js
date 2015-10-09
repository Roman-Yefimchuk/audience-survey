"use strict";

angular.module('tabHost', [

    'tabHost.tabWidget'

]).directive('tabHost', [

    function () {

        return {
            scope: {
                tabs: '=tabHost',
                onTabChanged: '&'
            },
            templateUrl: '/public/app/modules/tabHost/tabHost.html',
            controller: ['$scope', function ($scope) {

                function setActiveTab(tab) {

                    tab.isActive = true;
                    $scope.activeTab = tab;

                    $scope.onTabChanged({
                        tab: tab
                    });
                }

                $scope.activeTab = _.findWhere($scope.tabs, {
                    isActive: true
                });

                $scope.setActiveTab = setActiveTab;
            }]
        };
    }
]);