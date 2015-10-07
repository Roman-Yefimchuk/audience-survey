'use strict';

angular.module('services.profileExtractorService', [

    'services.dialogsService'

]).service('profileExtractorService', [

        '$q',
        'dialogsService',

        function ($q, dialogsService) {

            var requiredFields = [
                'email'
            ];

            function isProfileValid(profile) {
                for (var fieldIndex = 0; fieldIndex < requiredFields.length; fieldIndex++) {
                    if (!profile[requiredFields[fieldIndex]]) {
                        return false;
                    }
                }
                return true;
            }

            function extractProfile(account) {

                return $q(function (resolve, reject) {

                    var profile = account.profile;

                    if (isProfileValid(profile)) {
                        resolve((function () {
                            return angular.extend(profile, {
                                isEmailVerified: true
                            });
                        })());
                    } else {
                        dialogsService.showProfileBuilderDialog({
                            profile: profile,
                            onResolved: function (profile, closeCallback) {
                                closeCallback();
                                resolve((function () {
                                    return angular.extend(profile, {
                                        isEmailVerified: false
                                    });
                                })());
                            },
                            onRejected: function (closeCallback) {
                                closeCallback();
                                reject();
                            }
                        });
                    }
                });
            }

            return {
                extractProfile: extractProfile
            };
        }
    ]
);
