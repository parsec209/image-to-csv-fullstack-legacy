const logger = require('../config/logger')


module.exports = (err, req, res, next) => {

  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'
 
  const trustedErrors = {
    mongoose: ['CastError', 'ValidationError', 11000],
    passportLocalMongoose: ['IncorrectPasswordError', 'IncorrectUsernameError', 'MissingUsernameError', 'MissingPasswordError', 'UserExistsError'],
    multer: ['MulterError'],
    GCP: [3]
  }

  for (const API in trustedErrors) {
    if (trustedErrors[API].includes(err.name) || trustedErrors[API].includes(err.code)) {
      err.isOperational = true
      break
    }
  }

  err.isOperational = err.isOperational || false
  logger.log({ level: err.isOperational ? 'info' : 'error', message: err })
  
  
  //make the Mongodb duplicate field error message easier to read for user
  if (err.code && err.code === 11000) {
    const fieldAndValue = err.message.substring(err.message.indexOf('{'))
    const message = `The same value already exists for the following field: ${fieldAndValue}`
    err.message = message
  };

  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      message: 'An internal error occurred'
    })
  }
}
