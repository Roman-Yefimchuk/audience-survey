'use strict';

angular.module('services.profileExtractorService', [

    'services.dialogsService'

]).service('profileExtractorService', [

        '$q',
        'dialogsService',

        function ($q, dialogsService) {

            var providers = {
                'google': function (profile) {
                    return {
                        genericId: profile.id,
                        name: profile.displayName,
                        email: profile._json['email']
                    };
                },
                'facebook': function (profile) {
                    return {
                        genericId: profile.id,
                        name: profile.displayName,
                        email: (function () {
                            if ((profile.emails || []).length > 0) {
                                return profile.emails[0].value;
                            }
                        })()
                    };
                },
                'twitter': function (profile) {
                    return {
                        genericId: profile.id,
                        name: profile.displayName
                    };
                }
            };

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
                    var provider = account.provider;

                    if (provider in providers) {

                        profile = providers[provider](profile);

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
                    } else {
                        reject();
                    }
                });
            }

            return {
                extractProfile: extractProfile
            };
        }
    ]
);
