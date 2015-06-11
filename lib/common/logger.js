define(['l!loggerUtils'], function (loggerUtils) {

    'use strict';

    // Constant

    var LogLevels = {
        DEBUG: 'debug',
        ERROR: 'error',
        INFO: 'info',
        WARN: 'warn'
    };

    // Private functions

    var consoleSink = function () {
        if (console && typeof console.log === 'function') {
            var logMessage = arguments[0];
            var columns = [logMessage.timestamp, logMessage.level, logMessage.requestId, logMessage.message];
            console.log.apply(console, [columns.join('\t')]);
        }
    };

    // TODO: Move the formatter to a common loggerUtils class
    var formatter = function () {
        var format = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            argsCount = args.length,
            argPos = 0,
            formatted = null;

        if (typeof format !== 'string') {
            return format;
        }

        formatted = format.replace(/%([difjs])/g, function (match, token) {
            var arg = args[argPos++],
                argType = typeof arg;

            if (argType === 'undefined') {
                return argType;
            }

            switch (token) {
                case 'd':
                case 'i':
                    return argType === 'number' ? arg.toFixed() : arg;
                case 'f':
                    return argType === 'number' ? arg.toPrecision() : arg;
                case 'j':
                    return safeStringify(arg);
                case 's':
                    return arg;
            }
        });

        for (; argPos < argsCount; argPos++) {
            formatted += ' ' + safeStringify(args[argPos]);
        }

        return formatted;
    };

    var getRequestId = function () {
        var request = LAZO.app && LAZO.app.isServer && loggerUtils.getRequest();
        return (request && request.id) || '-';
    };

    var noop = function () {
    };

    var safeStringify = function (object) {
        try {
            if (object instanceof Error) {
                return serializeError(object);
            }

            return object && JSON.stringify(object);
        } catch (error) {
            // There might be a circular reference
            return LAZO.app && LAZO.app.isServer ? loggerUtils.serverStringify(object) : object;
        }
    };

    var serializeError = function (error) {
        var e = LAZO.app && LAZO.app.isServer && error ? {
            message: error.message, // TODO: Change to use '.toString()' so can override output
            stack: error.stack
        } : error;

        return JSON.stringify(e);
    };

    var unshift = function (args, level) {
        var array = Array.prototype.slice.call(args, 0);
        array.unshift(level);
        return array;
    };

    var convertArgsToArray = function (args) {

        // Do not slice arguments
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments

        if (args.length === 0) {
            return [];
        }

        var array = [];
        for (var i = 0; i < args.length; i++) {
            array.push(args[i]);
        }

        return array;

    };

    // Constructor

    var Logger = function (options) {

        // Private variables

        var self = this,

            level = options && options.level,

            sinks = (options && options.sinks) || {console: consoleSink},

        // Protected methods

            log = function () {
                var args = convertArgsToArray(arguments);
                //var timestamp = (new Date()).toISOString(),
                //    level = arguments[0] && arguments[0].toUpperCase(),
                //    args = Array.prototype.slice.call(arguments, 1),
                //    requestId = getRequestId(),
                //    columns = [timestamp, level, requestId, formatter.apply(self, args)],
                //    message = columns.join('\t');

                var appendLevelTag = function (msg) {
                    if (!_.isArray(msg.tags)) {
                        msg.tags = [msg.tags];
                    }

                    msg.tags.push(msg.level);
                };

                var msg = {
                    timestamp: (new Date()).toISOString(),
                    level: args.shift().toUpperCase(),
                    requestId: getRequestId(),
                    tags: []
                };

                if (args[0] instanceof Error) {
                    _.extend(msg, { error: args.shift() });
                    msg.message = formatter.apply(self, args); // strip the error arg from the front of the array
                    appendLevelTag(msg);
                }
                else if (_.isObject(args[0])) {
                    // assume JSON. Apply default values
                    msg = _.defaults(args[0], msg);
                    appendLevelTag(msg);
                }
                else {
                    // Default for backwards compatibility
                    _.extend(msg, { message: formatter.apply(self, args) });
                    appendLevelTag(msg);
                }

                for (var sink in sinks) {
                    if (sinks.hasOwnProperty(sink)) {
                        (function (sink) {
                            setTimeout(function () {
                                sinks[sink] && sinks[sink](msg);
                            }, 0);
                        }(sink));
                    }
                }

                return msg;
            },

            debugLog = function () {
                return log.apply(self, unshift(arguments, LogLevels.DEBUG));
            },

            errorLog = function () {
                return log.apply(self, unshift(arguments, LogLevels.ERROR));
            },

            infoLog = function () {
                return log.apply(self, unshift(arguments, LogLevels.INFO));
            },

            warnLog = function () {
                return log.apply(self, unshift(arguments, LogLevels.WARN));
            };

        // Public methods

        self.addSink = function (name, instance) {
            if (typeof name !== 'string' || typeof instance !== 'function') {
                throw new TypeError();
            }

            sinks[name] = instance;
        };

        self.consoleSink = consoleSink;

        self.getLevel = function () {
            return level;
        };

        self.getSinks = function () {
            return sinks;
        };

        self.removeSink = function (name) {
            if (sinks[name]) {
                delete sinks[name];
            }
        };

        self.setLevel = function (newLevel) {
            switch (newLevel) {
                case LogLevels.DEBUG:
                    self[LogLevels.DEBUG] = debugLog;
                    self[LogLevels.ERROR] = errorLog;
                    self[LogLevels.INFO] = infoLog;
                    self[LogLevels.WARN] = warnLog;
                    break;
                case LogLevels.ERROR:
                    self[LogLevels.DEBUG] = noop;
                    self[LogLevels.INFO] = noop;
                    self[LogLevels.WARN] = noop;
                    self[LogLevels.ERROR] = errorLog;
                    break;
                case LogLevels.INFO:
                    self[LogLevels.DEBUG] = noop;
                    self[LogLevels.INFO] = infoLog;
                    self[LogLevels.WARN] = warnLog;
                    self[LogLevels.ERROR] = errorLog;
                    break;
                case LogLevels.WARN:
                    self[LogLevels.DEBUG] = noop;
                    self[LogLevels.INFO] = noop;
                    self[LogLevels.WARN] = warnLog;
                    self[LogLevels.ERROR] = errorLog;
                    break;
                default:
                    return self.setLevel(LogLevels.ERROR);
            }

            infoLog('[common.logger.setLevel] Changing logging level to %s', newLevel);

            return level = newLevel;
        };

        // Init

        self.setLevel(level);
    };

    // Export singleton

    return new Logger();

});
