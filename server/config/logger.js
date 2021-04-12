const { createLogger, format, transports } = require('winston')
const { combine, timestamp, prettyPrint } = format
const { PapertrailTransport } = require('winston-papertrail-transport')
const moment = require('moment')
const pjson = require('../../package.json')



const consoleTransport = new transports.Console({
  handleExceptions: true,
  handleRejections: true
})


const logger = createLogger({
  level: 'info', 
  format: combine(
    timestamp({ format: () => {
      const today = moment()
      return today.format("DD-MM-YYYY h:mm:ssa")
    }}),
    prettyPrint()
  ),
  transports: [consoleTransport]
})


if (process.env.NODE_ENV === 'production') {
  const papertrailTransport = new PapertrailTransport({
    host: process.env.PAPERTRAIL_HOST,
    port: process.env.PAPERTRAIL_PORT,
    program: pjson.name,
    handleExceptions: true,
    handleRejections: true
  })
  logger.add(papertrailTransport)
}


logger.stream = {
  write: function(message, encoding) {
    logger.info(message)
  }
}


module.exports = logger