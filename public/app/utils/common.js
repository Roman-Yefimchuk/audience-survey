String.prototype.format = function (args) {
    var value = this;
    for (var key in args) {
        if (args[key] != undefined) {
            var pattern = new RegExp('@{' + key + '}', 'g');
            value = value.replace(pattern, args[key]);
        }
    }
    return String(value);
};

String.prototype.replaceAll = function (searchValue, replaceValue) {
    var pattern = new RegExp(searchValue, 'g');
    return this.replace(pattern, replaceValue);
};

Object.prototype.toQuery = function () {

    var query = '';

    for (var key in this) {

        if (this.hasOwnProperty(key) && this[key] && typeof this[key] != 'function') {

            if (query.length > 0) {
                query += '&' + key + '=' + this[key];
            }
        }
    }

    return query;
};