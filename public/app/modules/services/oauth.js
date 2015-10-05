"use strict";

angular.module('services.oauthService', []).

    service('oauthService', [

        '$q',

        function ($q) {

            var providers = {
                facebook: {
                    relativeUrl: '/authorize/facebook',
                    windowName: 'Facebook'
                },
                google: {
                    relativeUrl: '/authorize/google',
                    windowTitle: 'Google+'
                },
                twitter: {
                    relativeUrl: '/authorize/twitter',
                    windowName: 'Twitter'
                }
            };

            function getWindowFeatures() {

                var width = 650;
                var height = 450;

                return ('' +
                    'width=@{width},' +
                    'height=@{height},' +
                    'resizable=yes,' +
                    'scrollbars=yes,' +
                    'status=yes,' +
                    'top=@{top},' +
                    'left=@{left}' +
                    '').format({
                        width: width,
                        height: height,
                        left: (window.innerWidth - width) / 2,
                        top: (window.innerHeight - height) / 2
                    });
            }

            function getOrigin() {
                return window.location['origin'];
            }

            function authorize(providerId) {

                return $q(function (resolve, reject) {

                    if (providerId in providers) {

                        var relativeUrl = providers[providerId].relativeUrl;
                        var windowName = providers[providerId].windowName;
                        var oauthWindow = window.open(getOrigin() + relativeUrl, windowName, getWindowFeatures());

                        if (oauthWindow) {

                            var listener = function (event) {

                                var data = event.data;
                                if (event.origin == getOrigin() && AuthorizeStatus.isInstance(data)) {

                                    if (window.removeEventListener) {
                                        window.removeEventListener("message", listener, false);
                                    } else {
                                        window.detachEvent("onmessage", listener);
                                    }

                                    oauthWindow.close();

                                    var authorizeStatus = data;
                                    switch (authorizeStatus.statusCode) {
                                        case AuthorizeStatus.AUTHORIZE_RESOLVED:
                                        {
                                            var account = authorizeStatus.account;
                                            resolve(account);
                                            break;
                                        }
                                        case AuthorizeStatus.AUTHORIZE_REJECTED:
                                        {
                                            reject();
                                            break;
                                        }
                                    }
                                }
                            };

                            if (window.addEventListener) {
                                window.addEventListener("message", listener, false);
                            } else {
                                window.attachEvent("onmessage", listener);
                            }

                            oauthWindow.focus();
                        } else {
                            reject();
                        }
                    } else {
                        reject();
                    }
                });
            }

            return {
                authorize: authorize
            };
        }
    ])
;