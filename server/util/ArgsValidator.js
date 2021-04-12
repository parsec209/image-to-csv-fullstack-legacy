const typeCheck = require('type-check').typeCheck


module.exports = {


  validateArgs: (expectedArgs, actualArgs) => {

    //check if function call receives correct number of arguments
    if (expectedArgs.length !== actualArgs.length) {
      throw new Error('Unexpected arguments length')
    }

    //check if function call receives correct type of arguments
    expectedArgs.forEach(function(expectedArg, i) {
      const isExpectedType = typeCheck(expectedArg, actualArgs[i])
      if (!isExpectedType) {
        throw new TypeError(`Unexpected argument type at arguments index ${i}`)
      }
    })
  }
}







