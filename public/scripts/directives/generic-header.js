"use strict";

angular.module('application')

    .directive('genericHeader', [

        '$location',
        'profilesService',
        'dialogsService',
        'authService',

        function ($location, profilesService, dialogsService, authService) {
            return {
                scope: {
                    user: '=genericHeader',
                    backLink: '@'
                },
                templateUrl: '/public/views/directives/generic-header-view.html',
                controller: ['$scope', function ($scope) {

                    function editProfile() {

                        var user = $scope.user;

                        dialogsService.showProfileEditor({
                            userProfile: user.profile,
                            onSave: function (userProfile, editorCloseCallback) {

                                profilesService.updateProfile(user.id, userProfile)
                                    .then(function () {
                                        user.profile = userProfile;
                                        editorCloseCallback();
                                    }, function (e) {
                                        dialogsService.showAlert({
                                            title: 'Помилка',
                                            message: 'Не можливо змінити профіль',
                                            onClose: function (alertCloseCallback) {
                                                alertCloseCallback();
                                            }
                                        });
                                    });
                            }
                        });
                    }

                    function logout() {

                        authService.logout()
                            .then(function () {
                                $location.path('/');
                            });
                    }

                    $scope.editProfile = editProfile;
                    $scope.logout = logout;
                }]
            };
        }
    ]);