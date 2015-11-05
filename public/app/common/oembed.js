var oEmbed = {
    extend: function (target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];

            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    target[key] = source[key];
                }
            }
        }

        return target;
    },

    randomstring: function (target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];

            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    target[key] = source[key];
                }
            }
        }

        return target;
    },

    providers: (function () {
        function OEmbedProvider(name, type, urlschemesarray, apiendpoint, extraSettings, embedMethod) {
            this.name = name;
            this.type = type; // "photo", "video", "link", "rich", null
            this.urlschemes = urlschemesarray;
            this.apiendpoint = apiendpoint;
            this.maxWidth = 425;
            this.maxHeight = 300;
            extraSettings = extraSettings || {};

            if (extraSettings.useYQL) {

                if (extraSettings.useYQL == 'xml') {
                    extraSettings.yql = {
                        xpath: "//oembed/html",
                        from: 'xml',
                        apiendpoint: this.apiendpoint,
                        url: function (externalurl) {
                            return this.apiendpoint + '?format=xml&url=' + externalurl
                        },
                        datareturn: function (results) {
                            return results.html.replace(/.*\[CDATA\[(.*)\]\]>$/, '$1') || ''
                        }
                    };
                } else {
                    extraSettings.yql = {
                        from: 'json',
                        apiendpoint: this.apiendpoint,
                        url: function (externalurl) {
                            return this.apiendpoint + '?format=json&url=' + externalurl
                        },
                        datareturn: function (results) {
                            if (results.json.type != 'video' && (results.json.url || results.json.thumbnail_url)) {
                                return '<img src="' + (results.json.url || results.json.thumbnail_url) + '" />';
                            }
                            return results.json.html || ''
                        }
                    };
                }
                this.apiendpoint = null;
            }


            for (var property in extraSettings) {
                this[property] = extraSettings[property];
            }

            this.format = this.format || 'json';
            this.callbackparameter = this.callbackparameter || "callback";
            this.embedtag = this.embedtag || {tag: ""};
        }
        return [
            new OEmbedProvider("youtube", "video", ["youtube\\.com/watch.+v=[\\w-]+&?", "youtu\\.be/[\\w-]+", "youtube.com/embed"], 'http://www.youtube.com/embed/$1?wmode=transparent',
                {
                    templateRegex: /.*(?:v\=|be\/|embed\/)([\w\-]+)&?.*/, embedtag: {tag: 'iframe', width: '425', height: '300'}
                }
            ),
            new OEmbedProvider("slideshare", "rich", ["slideshare\.net"], "https://www.slideshare.net/api/oembed/2", {format: 'jsonp', prepareHtml: function (oEmbedData) {
                var div = document.createElement('div');
                div.innerHTML = oEmbedData.html;
                var iframe = div.querySelector('iframe');
                iframe.width = "";
                iframe.style.border = 0;
                iframe.style.width = "100%";
                oEmbedData.html = div.innerHTML.trim();
            }}),
            /*new OEmbedProvider("twitter", "rich", ["twitter.com/.+"], "https://api.twitter.com/1/statuses/oembed.json", {format: 'json'}),
             new OEmbedProvider("instagram", "photo", ["instagr\\.?am(\\.com)?/.+"], "https://api.instagram.com/oembed",{format: 'json'}), //ToDo thumbnails does not shown
             new OEmbedProvider("wikipedia", "rich", ["wikipedia.org/wiki/.+"], "http://$1.wikipedia.org/w/api.php?action=parse&page=$2&format=json&section=0&callback=?", {
             templateRegex: /.*\/\/([\w]+).*\/wiki\/([^\/]+).*!/,
             templateData: function (data) {
             if (!data.parse)
             return false;
             var text = data.parse['text']['*'].replace(/href="\/wiki/g, 'href="http://en.wikipedia.org/wiki');
             return  '<div id="content"><h3><a class="nav-link" href="http://en.wikipedia.org/wiki/' + data.parse['displaytitle'] + '">' + data.parse['displaytitle'] + '</a></h3>' + text + '</div>';
             }
             }),
             new OEmbedProvider("linkedin", "rich", ["linkedin.com/pub/.+"], "https://www.linkedin.com/cws/member/public_profile?public_profile_url=$1&format=inline&isFramed=true",
             {templateRegex: /(.*)/, embedtag: {tag: 'iframe', width: '368px', height: 'auto'}}),*/
            //new OEmbedProvider("googleviews", "rich", ["(.*maps\\.google\\.com\\/maps\\?).+(output=svembed).+(cbp=(.*)).*"], "https://maps.google.com/maps?layer=c&panoid=$3&ie=UTF8&source=embed&output=svembed&cbp=$5", {templateRegex: /(.*maps\.google\.com\/maps\?).+(panoid=(\w+)&).*(cbp=(.*)).*/, embedtag: {tag: 'iframe', width: 480, height: 360}, nocache: 1 }),
            //new OEmbedProvider("googlemaps", "rich", ["google\\.com\/maps\/place/.+"], "http://maps.google.com/maps?t=m&q=$1&output=embed", {templateRegex: /.*google\.com\/maps\/place\/([\w\+]*)\/.*/, embedtag: {tag: 'iframe', width: 480, height: 360 }, nocache: 1}),
            /*new OEmbedProvider("googlecalendar", "rich", ["www.google.com/calendar/embed?.+"], "$1",
             {templateRegex: /(.*)/, embedtag: {tag: 'iframe', width: '800', height: '600' }}),*/

        ]
    }).call(this),

    ajax: (function(){
        var type = getType();

        var jsonpID = 0,
            document = window.document,
            key,
            name,
            rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            scriptTypeRE = /^(?:text|application)\/javascript/i,
            xmlTypeRE = /^(?:text|application)\/xml/i,
            jsonType = 'application/json',
            htmlType = 'text/html',
            blankRE = /^\s*$/;

        var ajax = function(options){
            var settings = extend({}, options || {});
            for (key in ajax.settings) if (settings[key] === undefined) settings[key] = ajax.settings[key]

            ajaxStart(settings)

            if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
                RegExp.$2 != window.location.host

            var dataType = settings.dataType, hasPlaceholder = /=\?/.test(settings.url)
            if (dataType == 'jsonp' || hasPlaceholder) {
                if (!hasPlaceholder) settings.url = appendQuery(settings.url, 'callback=?')
                return ajax.JSONP(settings)
            }

            if (!settings.url) settings.url = window.location.toString()
            serializeData(settings)

            var mime = settings.accepts[dataType],
                baseHeaders = { },
                protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
                xhr = ajax.settings.xhr(), abortTimeout

            if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest'
            if (mime) {
                baseHeaders['Accept'] = mime
                if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
                xhr.overrideMimeType && xhr.overrideMimeType(mime)
            }
            if (settings.contentType || (settings.data && settings.type.toUpperCase() != 'GET'))
                baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded')
            settings.headers = extend(baseHeaders, settings.headers || {})

            xhr.onreadystatechange = function(){
                if (xhr.readyState == 4) {
                    clearTimeout(abortTimeout)
                    var result, error = false
                    if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                        dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'))
                        result = xhr.responseText

                        try {
                            if (dataType == 'script')    (1,eval)(result)
                            else if (dataType == 'xml')  result = xhr.responseXML
                            else if (dataType == 'json') result = blankRE.test(result) ? null : JSON.parse(result)
                        } catch (e) { error = e }

                        if (error) ajaxError(error, 'parsererror', xhr, settings)
                        else ajaxSuccess(result, xhr, settings)
                    } else {
                        ajaxError(null, 'error', xhr, settings)
                    }
                }
            }

            var async = 'async' in settings ? settings.async : true
            xhr.open(settings.type, settings.url, async)

            for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name])

            if (ajaxBeforeSend(xhr, settings) === false) {
                xhr.abort()
                return false
            }

            if (settings.timeout > 0) abortTimeout = setTimeout(function(){
                xhr.onreadystatechange = empty
                xhr.abort()
                ajaxError(null, 'timeout', xhr, settings)
            }, settings.timeout)

            // avoid sending empty string (#319)
            xhr.send(settings.data ? settings.data : null)
            return xhr
        }


// trigger a custom event and return false if it was cancelled
        function triggerAndReturn(context, eventName, data) {
            //todo: Fire off some events
            //var event = $.Event(eventName)
            //$(context).trigger(event, data)
            return true;//!event.defaultPrevented
        }

// trigger an Ajax "global" event
        function triggerGlobal(settings, context, eventName, data) {
            if (settings.global) return triggerAndReturn(context || document, eventName, data)
        }

// Number of active Ajax requests
        ajax.active = 0

        function ajaxStart(settings) {
            if (settings.global && ajax.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
        }
        function ajaxStop(settings) {
            if (settings.global && !(--ajax.active)) triggerGlobal(settings, null, 'ajaxStop')
        }

// triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
        function ajaxBeforeSend(xhr, settings) {
            var context = settings.context
            if (settings.beforeSend.call(context, xhr, settings) === false ||
                triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
                return false

            triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
        }
        function ajaxSuccess(data, xhr, settings) {
            var context = settings.context, status = 'success'
            settings.success.call(context, data, status, xhr)
            triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
            ajaxComplete(status, xhr, settings)
        }
// type: "timeout", "error", "abort", "parsererror"
        function ajaxError(error, type, xhr, settings) {
            var context = settings.context
            settings.error.call(context, xhr, type, error)
            triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error])
            ajaxComplete(type, xhr, settings)
        }
// status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
        function ajaxComplete(status, xhr, settings) {
            var context = settings.context
            settings.complete.call(context, xhr, status)
            triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
            ajaxStop(settings)
        }

// Empty function, used as default callback
        function empty() {}

        ajax.JSONP = function(options){
            if (!('type' in options)) return ajax(options)

            var callbackName = 'jsonp' + (++jsonpID),
                script = document.createElement('script'),
                abort = function(){
                    //todo: remove script
                    //$(script).remove()
                    if (callbackName in window) window[callbackName] = empty
                    ajaxComplete('abort', xhr, options)
                },
                xhr = { abort: abort }, abortTimeout,
                head = document.getElementsByTagName("head")[0]
                    || document.documentElement

            if (options.error) script.onerror = function() {
                xhr.abort()
                options.error()
            }

            window[callbackName] = function(data){
                clearTimeout(abortTimeout)
                //todo: remove script
                //$(script).remove()
                delete window[callbackName]
                ajaxSuccess(data, xhr, options)
            }

            serializeData(options)
            script.src = options.url.replace(/=\?/, '=' + callbackName)

            // Use insertBefore instead of appendChild to circumvent an IE6 bug.
            // This arises when a base node is used (see jQuery bugs #2709 and #4378).
            head.insertBefore(script, head.firstChild);

            if (options.timeout > 0) abortTimeout = setTimeout(function(){
                xhr.abort()
                ajaxComplete('timeout', xhr, options)
            }, options.timeout)

            return xhr
        }

        ajax.settings = {
            // Default type of request
            type: 'GET',
            // Callback that is executed before request
            beforeSend: empty,
            // Callback that is executed if the request succeeds
            success: empty,
            // Callback that is executed the the server drops error
            error: empty,
            // Callback that is executed on request complete (both: error and success)
            complete: empty,
            // The context for the callbacks
            context: null,
            // Whether to trigger "global" Ajax events
            global: true,
            // Transport
            xhr: function () {
                return new window.XMLHttpRequest()
            },
            // MIME types mapping
            accepts: {
                script: 'text/javascript, application/javascript',
                json:   jsonType,
                xml:    'application/xml, text/xml',
                html:   htmlType,
                text:   'text/plain'
            },
            // Whether the request is to another domain
            crossDomain: false,
            // Default timeout
            timeout: 0
        }

        function mimeToDataType(mime) {
            return mime && ( mime == htmlType ? 'html' :
                    mime == jsonType ? 'json' :
                        scriptTypeRE.test(mime) ? 'script' :
                        xmlTypeRE.test(mime) && 'xml' ) || 'text'
        }

        function appendQuery(url, query) {
            return (url + '&' + query).replace(/[&?]{1,2}/, '?')
        }

// serialize payload and append it to the URL for GET requests
        function serializeData(options) {
            if (type(options.data) === 'object') options.data = param(options.data)
            if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
                options.url = appendQuery(options.url, options.data)
        }

        ajax.get = function(url, success){ return ajax({ url: url, success: success }) }

        ajax.post = function(url, data, success, dataType){
            if (type(data) === 'function') dataType = dataType || success, success = data, data = null
            return ajax({ type: 'POST', url: url, data: data, success: success, dataType: dataType })
        }

        ajax.getJSON = function(url, success){
            return ajax({ url: url, success: success, dataType: 'json' })
        }

        var escape = encodeURIComponent

        function serialize(params, obj, traditional, scope){
            var array = type(obj) === 'array';
            for (var key in obj) {
                var value = obj[key];

                if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']'
                // handle data in serializeArray() format
                if (!scope && array) params.add(value.name, value.value)
                // recurse into nested objects
                else if (traditional ? (type(value) === 'array') : (type(value) === 'object'))
                    serialize(params, value, traditional, key)
                else params.add(key, value)
            }
        }

        function param(obj, traditional){
            var params = []
            params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
            serialize(params, obj, traditional)
            return params.join('&').replace('%20', '+')
        }

        function extend(target) {
            var slice = Array.prototype.slice;
            slice.call(arguments, 1).forEach(function(source) {
                for (key in source)
                    if (source[key] !== undefined)
                        target[key] = source[key]
            })
            return target
        }

        function getType () {
            var toString = Object.prototype.toString

            return function(val){
                switch (toString.call(val)) {
                    case '[object Function]': return 'function'
                    case '[object Date]': return 'date'
                    case '[object RegExp]': return 'regexp'
                    case '[object Arguments]': return 'arguments'
                    case '[object Array]': return 'array'
                    case '[object String]': return 'string'
                }

                if (typeof val == 'object' && val && typeof val.length == 'number') {
                    try {
                        if (typeof val.callee == 'function') return 'arguments';
                    } catch (ex) {
                        if (ex instanceof TypeError) {
                            return 'arguments';
                        }
                    }
                }

                if (val === null) return 'null'
                if (val === undefined) return 'undefined'
                if (val && val.nodeType === 1) return 'element'
                if (val === Object(val)) return 'object'

                return typeof val
            };
        }

        return ajax;
    }).call(this),

    doEmbed: function () {
        var self = this;
        var resourceURL = (self.url && (!self.url.indexOf('http://') || !self.url.indexOf('https://'))) ? self.url : "",
            provider = self.getOEmbedProvider(resourceURL);

        if (self.embedAction) {
            self.settings.onEmbed = self.embedAction;
        } else if (!self.settings.onEmbed) {
            self.settings.onEmbed = function (oembedData) {
                //self.insertCode(self.settings.embedMethod, oembedData);
                self.callbackData.data = oembedData;
                self.settings.callCallback(self.callbackData);
            };
        }

        if (resourceURL !== null && resourceURL !== undefined && provider !== null) {
            provider.params = self.getNormalizedParams(self.settings[provider.name]) || {};
            provider.maxWidth = self.settings.maxWidth;
            provider.maxHeight = self.settings.maxHeight;
            self.embedCode(resourceURL, provider);
        } else {
            self.settings.onProviderNotFound(self.callbackData);
        }
    },

    embedCode: function (externalUrl, embedProvider) {
        var self = this;
        //var container = this.container;
        var ajaxopts,
            extend = this.extend,
            ajax = this.ajax;
        if (embedProvider.templateRegex) {
            if (embedProvider.embedtag.tag !== '') {
                var div = document.createElement('div');
                var flashvars = embedProvider.embedtag.flashvars || '';
                var tag = embedProvider.embedtag.tag || 'embed';
                var width = embedProvider.embedtag.width || 'auto';
                var height = embedProvider.embedtag.height || 'auto';
                var src = externalUrl.replace(embedProvider.templateRegex, embedProvider.apiendpoint);

                if (!embedProvider.nocache) {
                    src += '&jqoemcache=' + this.randomstring(5);
                }

                if (embedProvider.apikey) {
                    src = src.replace('_APIKEY_', self.settings.apikeys[embedProvider.name]);
                }
                var iframe = document.createElement('iframe');
                iframe.width = "100%";
                iframe.height = height;
                iframe.setAttribute('allowfullscreen', true);
                iframe.setAttribute('allowscriptaccess', 'always');
                iframe.src = src;
                iframe.style.maxHeight = self.settings.maxHeight || 'auto';
                iframe.style.maxWidth = self.settings.maxWidth || 'auto';
                iframe.style.border = 0;

                if (tag == 'embed') {
                    iframe.setAttribute('type', embedProvider.embedtag.type || "application/x-shockwave-flash");
                    iframe.setAttribute('flashvars', externalUrl.replace(embedProvider.templateRegex, flashvars));
                }

                if (tag == 'iframe') {
                    iframe.setAttribute('scrolling', embedProvider.embedtag.scrolling || "no");
                    iframe.setAttribute('frameborder', embedProvider.embedtag.frameborder || "0");
                }
                div.appendChild(iframe);
                self.success({html: div.innerHTML}, externalUrl);
            } else if (embedProvider.apiendpoint) {
                //Add APIkey if true
                if (embedProvider.apikey)
                    embedProvider.apiendpoint = embedProvider.apiendpoint.replace('_APIKEY_', self.settings.apikeys[embedProvider.name]);

                ajaxopts = extend({
                    url: externalUrl.replace(embedProvider.templateRegex, embedProvider.apiendpoint),
                    dataType: 'jsonp',
                    success: function (data) {
                        var oembedData = extend({}, data);
                        oembedData.html = embedProvider.templateData(data);
                        self.success(oembedData, externalUrl);
                    },
                    error: function () {
                        self.error(externalUrl, embedProvider);
                    }
                }, self.settings.ajaxOptions);
                ajax(ajaxopts);
            } else {
                self.success({html: externalUrl.replace(embedProvider.templateRegex, embedProvider.template)}, externalUrl);
            }
        } else {
            var requestUrl = self.getRequestUrl(embedProvider, externalUrl);
            ajaxopts = extend({
                url: requestUrl,
                dataType: embedProvider.dataType || 'jsonp',
                success: function (data) {
                    var oembedData = extend({}, data);
                    switch (oembedData.type) {
                        case "file": //Deviant Art has this
                        case "photo":
                            oembedData.html = self.getPhotoCode(externalUrl, oembedData);
                            break;
                        case "video":
                        case "rich":
                            oembedData.html = self.getRichCode(externalUrl, oembedData);
                            break;
                        default:
                            oembedData.html = self.getGenericCode(externalUrl, oembedData);
                            break;
                    }
                    embedProvider.prepareHtml(oembedData);
                    self.success(oembedData, externalUrl);
                },
                error: function () {
                    self.error(externalUrl, embedProvider);
                }
            }, self.settings.ajaxOptions);
            ajax(ajaxopts);
        }
    },

    getPhotoCode: function (url, oembedData) {
        var html;
        var alt = oembedData.title ? oembedData.title : '';
        alt += oembedData.author_name ? ' - ' + oembedData.author_name : '';
        alt += oembedData.provider_name ? ' - ' + oembedData.provider_name : '';

        if (oembedData.url) {
            html = '<div><a href="' + url + '" target=\'_blank\'><img src="' + oembedData.url + '" alt="' + alt + '"/></a></div>';
        } else if (oembedData.thumbnail_url) {
            var newURL = oembedData.thumbnail_url.replace('_s', '_b');
            html = '<div><a href="' + url + '" target=\'_blank\'><img src="' + newURL + '" alt="' + alt + '"/></a></div>';
        } else {
            html = '<div>Error loading this picture</div>';
        }

        if (oembedData.html) {
            html += "<div>" + oembedData.html + "</div>";
        }

        return html;
    },

    getRichCode: function (url, oembedData) {
        return oembedData.html;
    },

    getGenericCode: function (url, oembedData) {
        var title = ((oembedData.title) && (oembedData.title !== null)) ? oembedData.title : url;
        var html = '<a href="' + url + '">' + title + '</a>';

        if (oembedData.html) {
            html += "<div>" + oembedData.html + "</div>";
        }

        return html;
    },

    getOEmbedProvider: function (url) {
        for (var i = 0; i < this.providers.length; i++) {
            for (var j = 0, l = this.providers[i].urlschemes.length; j < l; j++) {
                var regExp = new RegExp(this.providers[i].urlschemes[j], "i");

                if (url.match(regExp) !== null)
                    return this.providers[i];
            }
        }

        return null;
    },

    getRequestUrl: function (provider, externalUrl) {
        var url = provider.apiendpoint,
            qs = "",
            i;
        url += (url.indexOf("?") <= 0) ? "?" : "&";
        url = url.replace('#', '%23');

        if (provider.maxWidth !== null && (typeof provider.params.maxwidth === 'undefined' || provider.params.maxwidth === null)) {
            provider.params.maxwidth = provider.maxWidth;
        }

        if (provider.maxHeight !== null && (typeof provider.params.maxheight === 'undefined' || provider.params.maxheight === null)) {
            provider.params.maxheight = provider.maxHeight;
        }

        for (i in provider.params) {
            // We don't want them to jack everything up by changing the callback parameter
            if (i == provider.callbackparameter)
                continue;

            // allows the options to be set to null, don't send null values to the server as parameters
            if (provider.params[i] !== null)
                qs += "&" + escape(i) + "=" + provider.params[i];
        }

        url += "format=" + provider.format + "&url=" + escape(externalUrl) + qs;
        if (provider.dataType != 'json')
            url += "&" + provider.callbackparameter + "=?";

        return url;
    },

    getNormalizedParams: function (params) {
        if (params === null) return null;
        var key, normalizedParams = {};
        for (key in params) {
            if (key !== null) normalizedParams[key.toLowerCase()] = params[key];
        }
        return normalizedParams;
    },

    success: function (oembedData, externalUrl) {
        this.callbackData.isOEmbed = true;
        this.data['data-external-url'] = oembedData.html;
        //this.settings.beforeEmbed.call(oembedData);
        this.settings.onEmbed(oembedData);
        //this.settings.afterEmbed.call(oembedData);
    },

    error: function (oembedData) {
        this.settings.onError(this.callbackData);
    },

    Oembed: function (url,def) {
        this.url = url;
        this.callbackData = {
            isOEmbed: false,
            data: {}
        };
        var defaults = {
            fallback: true,
            maxWidth: 425,
            maxHeight: 300,
            includeHandle: true,
            embedMethod: 'auto',
            // "auto", "append", "fill"
            onProviderNotFound: function (data) {
                this.callCallback(data);
            },
            beforeEmbed: function () {},
            afterEmbed: function () {
                //this.callCallback();
            },
            onEmbed: false,
            onError: function (data) {
                this.callCallback(data);
                //console.log('err:', a, b, c, d);
            },
            ajaxOptions: {},
            callCallback: function (data) {
                def.resolve(data);
            }
        };
        this.data = {};
        this.settings = defaults;

        this.doEmbed();
    }
};
function loadOEmbedData (url) {
    "use strict";
    var def = $.Deferred();
    if (!url) {
        url = "";
    }
    oEmbed.Oembed(url,def)
    return def;
}
function isOEmbedLink (url) {
    "use strict";

    if (!url) {
        url = "";
    }
    return !oEmbed.getOEmbedProvider(url);
}