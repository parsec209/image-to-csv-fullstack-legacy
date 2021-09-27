//@ts-check


/**
 * Class to create an inputError object, used for operational client input errors
 * @extends Error
 */
class InputError extends Error {
  /**
   * Create an inputError
   * @namespace
   * @param {string} message - Custom message about the input error
   * @param {number} statusCode - HTTP response status code
   */
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
    this.status = 'fail'
    this.isOperational = true
  }
}

module.exports = InputError







