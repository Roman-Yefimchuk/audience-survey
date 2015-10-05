"use strict";

angular.module('dialogs.profileBuilderDialog', [

    'constants'

]).controller('ProfileBuilderDialogController', [

        '$scope',
        '$modalInstance',
        'options',
        'NAME_PATTERN',
        'EMAIL_PATTERN',

        function ($scope, $modalInstance, options, namePattern, emailPattern) {

            var profile = options.profile;
            var onResolved = options.onResolved || function (closeCallback) {
                closeCallback();
            };
            var onRejected = options.onRejected || function (closeCallback) {
                closeCallback();
            };

            function isNameValid() {
                var name = ($scope.profile['name'] || '');
                return namePattern.test(name);
            }

            function isEmailValid() {
                var email = ($scope.profile['email'] || '');
                return emailPattern.test(email);
            }

            function resolve() {
                onResolved($scope.profile, function () {
                    $modalInstance.close();
                });
            }

            function reject() {
                onRejected(function () {
                    $modalInstance.close();
                });
            }

            function isDisabled() {
                return angular.equals($scope.profile, profile) || !isNameValid() || !isEmailValid()
            }

            $scope.profile = angular.copy(profile);
            $scope.originalProfile = angular.copy(profile);

            $scope.isNameValid = isNameValid;
            $scope.isEmailValid = isEmailValid;
            $scope.resolve = resolve;
            $scope.reject = reject;
            $scope.isDisabled = isDisabled;
        }
    ]
);
