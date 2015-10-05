var AuthorizeStatus = (function () {

    function AuthorizeStatus(statusCode, account) {
        this.statusCode = statusCode;
        if (statusCode == AuthorizeStatus.AUTHORIZE_RESOLVED) {
            this.account = account;
        }
    }

    AuthorizeStatus.AUTHORIZE_RESOLVED = 'AUTHORIZE_RESOLVED';
    AuthorizeStatus.AUTHORIZE_REJECTED = 'AUTHORIZE_REJECTED';

    AuthorizeStatus.isInstance = function (obj) {
        return obj && (obj.statusCode == AuthorizeStatus.AUTHORIZE_RESOLVED ||
            obj.statusCode == AuthorizeStatus.AUTHORIZE_REJECTED);
    };

    return AuthorizeStatus;

})();