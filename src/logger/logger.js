const path = require('path');
const { createLogger, format, transports } = require('winston');
const fs = require('fs');

const logsDir = 'logs';
const filename = path.join(logsDir, 'logs-api-all.log');
const filenameErr = path.join(logsDir, 'logs-etl-error.log');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Return the last folder name in the path and the calling
// module's filename.
const getLabel = function getLabel(callingModule) {
  const parts = callingModule.filename.split(path.sep);
  return path.join(parts[parts.length - 2], parts.pop());
};

module.exports = function getLogger(module) {
  return createLogger({
    format: format.combine(
      format.label({ label: getLabel(module) }),
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      format.printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`),
    ),
    transports: [
      new transports.Console({
        level: 'info',
        format: format.combine(
          format.colorize(),
          format.printf(
            info => `${info.timestamp} [${info.label}] ${info.level} : ${info.message}`,
          ),
        ),
      }),
      new transports.File({
        maxsize: 5120000,
        maxFiles: 5,
        filename,
      }),
      new transports.File({
        level: 'error',
        maxsize: 5120000,
        maxFiles: 5,
        filename: filenameErr,
      }),
    ],
  });
};
