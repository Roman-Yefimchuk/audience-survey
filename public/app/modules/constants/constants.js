'use strict';

angular.module('constants', [])

    .constant("NAME_PATTERN", /^(\w+[a-zA-Z0-9\s]*){3}$/)
    .constant("EMAIL_PATTERN", /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
    .constant("PASSWORD_PATTERN", /^(.+){6}$/)
    .constant("DEBUG_MODE", true)
    .constant("socketUrl", window.location['protocol'] + "//" + window.location['host'])
    .constant("isEmbeddedClient", !!window['__embeddedClient__']);