//Operational errors originating from client input

class InputError extends Error {
  
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.status = 'fail'
    this.isOperational = true
  }
}

module.exports = InputError







