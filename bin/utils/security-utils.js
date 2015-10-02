"use strict";

(function (require) {

    var BCrypt = require('bcrypt-nodejs');
    var Promise = require('q')['promise'];
    var Guid = require('guid');
    var Crypto = require('crypto');

    function generateHash(data) {
        return BCrypt.hashSync(data, BCrypt.genSaltSync(8), null);
    }

    function validateHash(data, hashedData) {
        return BCrypt.compareSync(data, hashedData);
    }

    function validateHashAsync(hashedPassword, password) {

        return Promise(function (resolve, reject) {

            BCrypt.compare(password, hashedPassword, function (error, result) {

                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }

    function decodeBase64(encoded) {
        return new Buffer(encoded || '', 'base64').toString('utf8');
    }

    function encodeBase64(unencoded) {
        return new Buffer(unencoded || '').toString('base64');
    }

    function guid() {
        return Guid.raw();
    }

    function generateToken(length) {
        var buffer = Crypto.randomBytes(length || 64);
        return buffer.toString('hex');
    }

    module.exports = {
        generateHash: generateHash,
        validateHash: validateHash,
        validateHashAsync: validateHashAsync,
        decodeBase64: decodeBase64,
        encodeBase64: encodeBase64,
        generateToken: generateToken
    };
})(require);