"use strict";

angular.module('application')

    .directive('genericHeader', [

        '$location',
        'profilesService',
        'socketConnectorService',
        'dialogsService',
        'authService',

        function ($location, profilesService, socketConnectorService, dialogsService, authService) {
            return {
                scope: {
                    user: '=',
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
                                socketConnectorService.closeConnection();
                                $location.path('/');
                            });
                    }

                    $scope.editProfile = editProfile;
                    $scope.logout = logout;
                }]
            };
        }
    ]);