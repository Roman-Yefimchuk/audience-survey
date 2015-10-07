"use strict";

angular.module('services.oauthService', [

    'services.logProxyService',
    'constants'

]).service('oauthService', [

    '$q',
    'logProxyService',
    'isEmbeddedClient',

    function ($q, logProxyService, isEmbeddedClient) {

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

        function getOrigin() {
            return window.location['origin'];
        }

        var authorize = (function () {

            if (isEmbeddedClient) {

                return function (providerId) {

                    return $q(function (resolve, reject) {

                        if (providerId in providers) {

                            try {
                                var relativeUrl = providers[providerId].relativeUrl;
                                var oauthWindow = window.open(getOrigin() + relativeUrl, '_blank', 'location=no,toolbar=no');

                                if (oauthWindow) {

                                    var onLoadStopListener = function (event) {

                                        var url = event.url;

                                        if (/^[a-z]+\:\/\/.*\/authorize\/resolved\?.*$/.test(url)) {

                                            var getParameterByName = function (name) {

                                                name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");

                                                var search = url.replace(/.*(\?.*)/, function (url, search) {
                                                    return search;
                                                });

                                                var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
                                                var results = regex.exec(search);
                                                return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
                                            };

                                            var account = {
                                                profile: {
                                                    id: getParameterByName('profileId'),
                                                    name: getParameterByName('name'),
                                                    email: getParameterByName('email')
                                                },
                                                provider: getParameterByName('provider')
                                            };

                                            oauthWindow.close();
                                            resolve(account);
                                        } else {

                                            if (/^[a-z]+\:\/\/.*\/authorize\/rejected\?.*$/.test(url)) {

                                                oauthWindow.close();
                                                reject();
                                            }
                                        }
                                    };

                                    var onExitListener = function () {
                                        oauthWindow.removeEventListener('loadstop', onLoadStopListener);
                                        oauthWindow.removeEventListener('exit', onExitListener);
                                    };

                                    oauthWindow.addEventListener('loadstop', onLoadStopListener, false);
                                    oauthWindow.addEventListener('exit', onExitListener, false);
                                } else {
                                    reject();
                                }
                            } catch (e) {
                                logProxyService.error(e);
                                reject();
                            }

                        } else {
                            reject();
                        }
                    });
                }
            }

            return (function () {

                function getWindowFeatures() {

                    var width = 650;
                    var height = 450;

                    return ('' +
                        'width=@{width},' +
                        'height=@{height},' +
                        'resizable=yes,' +
                        'location=yes,' +
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

                return function (providerId) {

                    return $q(function (resolve, reject) {

                        if (providerId in providers) {

                            var relativeUrl = providers[providerId].relativeUrl;
                            var oauthWindow = window.open(getOrigin() + relativeUrl, '_blank', getWindowFeatures());

                            if (oauthWindow) {

                                var onMessageListener = function (event) {

                                    var data = event.data;
                                    if (event.origin == getOrigin() && AuthorizeStatus.isInstance(data)) {

                                        if (window.removeEventListener) {
                                            window.removeEventListener("message", onMessageListener, false);
                                        } else {
                                            window.detachEvent("onmessage", onMessageListener);
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
                                    window.addEventListener("message", onMessageListener, false);
                                } else {
                                    window.attachEvent("onmessage", onMessageListener);
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
            })();
        })();

        return {
            authorize: authorize
        };
    }
])
;