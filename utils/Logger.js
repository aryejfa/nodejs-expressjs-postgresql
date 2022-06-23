const { createLogger, format, transports } = require("winston");

let date = new Date();
let year = date.getUTCFullYear();
let month = date.getUTCMonth();
let day = date.getUTCDate();

const datetime = `log_${year}_${month}_${day}.log`;

module.exports = createLogger({
  transports: new transports.File({
    filename: `logs/${datetime}`,
    format: format.combine(
      format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
      format.align(),
      format.printf(
        (info) => `${info.level}: ${[info.timestamp]}: ${info.message}`
      )
    ),
  }),
});
