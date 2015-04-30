"use strict";

angular.module('application')

    .directive('genericHeader', [

        'apiService',
        'dialogsService',

        function (apiService, dialogsService) {
            return {
                scope: {
                    user: '=',
                    backLink: '@'
                },
                templateUrl: '/client/views/directives/generic-header-view.html',
                controller: ['$scope', function ($scope) {

                    function editProfile() {

                        var user = $scope.user;

                        apiService.getUserProfile(user.userId, {
                            success: function (userProfile) {
                                dialogsService.showProfileEditor({
                                    userProfile: userProfile,
                                    onSave: function (userProfile, editorCloseCallback) {
                                        apiService.updateUserProfile(user.userId, userProfile, {
                                            success: function () {
                                                user.name = userProfile.name;
                                                editorCloseCallback();
                                            },
                                            failure: function () {
                                                dialogsService.showAlert({
                                                    title: 'Помилка',
                                                    message: 'Не можливо змінити профіль',
                                                    onClose: function (alertCloseCallback) {
                                                        editorCloseCallback();
                                                        alertCloseCallback();
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            },
                            failure: function (error) {
                                dialogsService.showAlert({
                                    title: 'Помилка',
                                    message: 'Не можливо завантажити профіль'
                                });
                            }
                        });
                    }

                    $scope.editProfile = editProfile;
                }]
            };
        }
    ]);