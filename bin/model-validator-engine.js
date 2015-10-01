"use strict";

(function (require) {

    var _ = require('underscore');

    var ValidationStrategy = (function () {

        function verifyStrategy(config) {

            _.forEach(config, function (property) {

                if (property instanceof ValidationStrategy) {
                    return;
                }

                if (typeof property.mandatory == 'undefined') {

                    property.mandatory = true;
                }

                if (typeof property.allowNull == 'undefined') {

                    property.allowNull = false;
                }

                if (typeof property['default'] == 'undefined') {

                    return;
                }

                if (typeof property['default'] != 'function') {

                    var defaultValue = property['default'];

                    property['default'] = function () {

                        return defaultValue;
                    };
                }
            });
        }

        function ValidationStrategy(config) {
            verifyStrategy(config);
            this.config = config;
        }

        return ValidationStrategy;
    })();

    var ModelValidatorEngine = (function () {

        function executeValidator(errors, validateFn, propertyName) {

            var message = validateFn();
            if (message) {

                errors[propertyName] = message;

                return false;
            }

            return true;
        }

        function validateDependencies(errors, dependencies, propertyName, validate) {

            return _.all(dependencies, function (dependency) {

                if ((dependency.dependencies || []).length > 0) {

                    if (validateDependencies(errors, dependency.dependencies || [], propertyName, function (validateFn) {

                        return validate(function (model, key) {

                            return validateFn(model, key);
                        });
                    })) {

                        return executeValidator(errors, function () {

                            return validate(function (key, model) {

                                return dependency.validate(key, model);
                            });
                        }, propertyName);
                    }

                    return false;

                } else {

                    return executeValidator(errors, function () {

                        return validate(function (key, model) {

                            return dependency.validate(key, model);
                        });
                    }, propertyName);
                }
            });
        }

        function validateModel(errors, model, config, parentModel) {

            _.forEach(config, function (property, key) {

                if (property instanceof ValidationStrategy) {

                    validateModel(errors, model[key], property.config, key);
                } else {

                    if (!property.mandatory) {

                        if (typeof model[key] == 'undefined' || model[key] == null) {

                            if (property.default) {

                                model[key] = property.default();

                                if (model[key] == null && property.allowNull) {

                                    return;
                                }
                            } else {

                                return;
                            }
                        }
                    }

                    var propertyName = parentModel ? (parentModel + '.' + key) : key;

                    _.all(property.rules, function (validationRule) {

                        var dependencies = validationRule.dependencies || [];
                        if ((dependencies || []).length > 0) {

                            if (validateDependencies(errors, dependencies, propertyName, function (validateFn) {

                                return validateFn(model, key);
                            })) {

                                return executeValidator(errors, function () {

                                    return validationRule.validate(model, key);
                                }, propertyName);
                            }

                            return false;
                        } else {

                            return executeValidator(errors, function () {

                                return validationRule.validate(model, key);
                            }, propertyName);
                        }
                    });
                }
            });
        }

        var ModelValidatorEngine = function (model, validationStrategy) {

            this.model = model;

            if (validationStrategy instanceof ValidationStrategy) {

                this.config = validationStrategy.config;
            } else {

                throw 'Invalid validation strategy';
            }
        };

        ModelValidatorEngine.prototype = {
            validate: function () {

                var errors = {};

                validateModel(errors, this.model, this.config);

                if (_.size(errors) > 0) {

                    return errors;
                }
            }
        };

        return ModelValidatorEngine;
    })();

    function formatErrorMessage(s, args) {

        if (typeof args != 'object') {
            return s;
        }

        var value = s;
        for (var key in args) {
            if (args[key] != undefined && args.hasOwnProperty(key)) {
                var pattern = new RegExp('@{' + key + '}', 'g');
                value = value.replace(pattern, args[key]);
            }
        }

        return String(value);
    }

    var ValidationRule = (function () {

        function ValidationRule(id, func, dependencies) {
            this.id = id;
            this.func = func;
            this.dependencies = dependencies || [];
        }

        ValidationRule.prototype = {
            validate: function (model, propertyName) {

                var message = this.func(model, propertyName);
                if (message) {

                    return {
                        id: this.id,
                        message: message
                    }
                }
            }
        };

        ValidationRule.require = function (message) {
            return new ValidationRule('REQUIRE',
                function (model, propertyName) {
                    if (typeof model[propertyName] == 'undefined' || model[propertyName] == null) {
                        return message;
                    }
                });
        };

        ValidationRule.number = function (message) {
            return new ValidationRule('NUMBER',
                function (model, propertyName) {
                    if (typeof model[propertyName] != 'number') {
                        return message;
                    }
                }, [
                    ValidationRule.require(message)
                ]);
        };

        ValidationRule.string = function (message) {
            return new ValidationRule('STRING',
                function (model, propertyName) {
                    if (typeof model[propertyName] != 'string') {
                        return message;
                    }
                }, [
                    ValidationRule.require(message)
                ]);
        };

        ValidationRule.boolean = function (message) {
            return new ValidationRule('BOOLEAN',
                function (model, propertyName) {
                    if (typeof model[propertyName] != 'boolean') {
                        return message;
                    }
                }, [
                    ValidationRule.require(message)
                ]);
        };

        ValidationRule.range = function (min, max, message) {
            return new ValidationRule('RANGE',
                function (model, propertyName) {
                    var value = model[propertyName];
                    if (value < min || value > max) {
                        return formatErrorMessage(message, {
                            min: min,
                            max: max
                        });
                    }
                }, [
                    ValidationRule.number((function () {
                        return formatErrorMessage(message, {
                            min: min,
                            max: max
                        });
                    })())
                ]);
        };

        ValidationRule.stringLength = function (min, max, message) {
            return new ValidationRule('STRING_LENGTH',
                function (model, propertyName) {
                    var length = model[propertyName].length;
                    if (length < min || length > max) {
                        return formatErrorMessage(message, {
                            min: min,
                            max: max
                        });
                    }
                }, [
                    ValidationRule.string((function () {
                        return formatErrorMessage(message, {
                            min: min,
                            max: max
                        });
                    })())
                ]);
        };

        ValidationRule.minStringLength = function (min, message) {
            return new ValidationRule('MIN_STRING_LENGTH',
                function (model, propertyName) {
                    var length = model[propertyName].length;
                    if (length < min) {
                        return formatErrorMessage(message, {
                            min: min
                        });
                    }
                }, [
                    ValidationRule.string((function () {
                        return formatErrorMessage(message, {
                            min: min
                        });
                    })())
                ]);
        };

        ValidationRule.maxStringLength = function (max, message) {
            return new ValidationRule('MAX_STRING_LENGTH',
                function (model, propertyName) {
                    var length = model[propertyName].length;
                    if (length > max) {
                        return formatErrorMessage(message, {
                            max: max
                        });
                    }
                }, [
                    ValidationRule.string((function () {
                        return formatErrorMessage(message, {
                            max: max
                        });
                    })())
                ]);
        };

        ValidationRule.reqExpr = function (reqExpr, message) {
            return new ValidationRule('REG_EXPR',
                function (model, propertyName) {
                    if (!reqExpr.test(model[propertyName])) {
                        return message;
                    }
                }, [
                    ValidationRule.string(message)
                ]);
        };

        ValidationRule.email = function (message) {
            return new ValidationRule('EMAIL',
                function (model, propertyName) {
                    if (!/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/.test(model[propertyName])) {
                        return message;
                    }
                }, [
                    ValidationRule.string(message)
                ]);
        };

        ValidationRule.phone = function (message) {
            return new ValidationRule('PHONE',
                function (model, propertyName) {
                    if (!/^([0-9\(\)\/\+ \-]*)$/.test(model[propertyName])) {
                        return message;
                    }
                }, [
                    ValidationRule.string(message)
                ]);
        };

        ValidationRule.options = function (options, message) {
            return new ValidationRule('OPTIONS',
                function (model, propertyName) {

                    var isValid = false;

                    _.forEach(options, function (option) {
                        if (model[propertyName] == option) {
                            isValid = true;
                        }
                    });

                    if (!isValid) {
                        return message;
                    }
                }, [
                    ValidationRule.require(message)
                ]);
        };

        ValidationRule.url = function (message) {
            return new ValidationRule('URL',
                function (model, propertyName) {
                }, [
                    ValidationRule.string(message)
                ]);
        };

        return ValidationRule;
    })();

    ModelValidatorEngine.ValidationStrategy = ValidationStrategy;
    ModelValidatorEngine.ValidationRule = ValidationRule;

    module.exports = ModelValidatorEngine;

})(require);