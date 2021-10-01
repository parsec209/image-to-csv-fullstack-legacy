const InputError = require('./inputError')


//Custom database validations


module.exports = {


  //user validators

  passwordValidator: function(password, cb) {
    if (!password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)) {
      return cb(new InputError('Password must be at least eight characters long and contain an upper case letter, a lower case letter, and a number, with no special characters', 400))
    }
    return cb()
  },


  //header validators

  headerHasNoDuplicates: {
    validator: function(v) {
      const valuesSoFar = Object.create(null)
      for (let i = 0; i < v.length; i++) {
        let value = v[i]['value']
        if (value in valuesSoFar) {
          return false
        }
        valuesSoFar[value] = true
      }
      return true
    },
    message: 'Duplicate header cell values not allowed'
  },

  headerMeetsRequiredLength: {
    validator: function(v) {     
      if (v.length && v.length <= 52) {
        return true
      } else {
        return false
      }
    },
    message: 'Must have between one and 52 header cells'
  },


  //cellSect validators

  phraseCountIsInteger: {
    validator: function(v) {
      return Number.isInteger(v)
    },
    message: 'PhraseCount must be an integer'
  },

  searchOrInputMethodIsNotToday: {
    validator: function(v) {  
      if (this.searchOrInputMethod === 'today') {
        return false
      } else {
        return true
      }
    },
    message: 'PhraseOrValue cannot be included when the searchOrInputMethod is "today"'
  },

  searchOrInputMethodIsDefined: {
    validator: function(v) { 
      if (!this.searchOrInputMethod) {
        return false
      } else {
        return true
      }
    },
    message: 'The inclusion of this property requires a searchOrInputMethod'
  },  
  

  daysAddedIsInteger: {
    validator: function(v) {
      return Number.isInteger(v)
    },
    message: 'Added days must be an integer'
  },


  //dataCell validators

  cellSectsMeetsRequiredLength: {
    validator: function(v) {     
      if (v.length && v.length <= 4) {
        return true
      } else {
        return false
      }
    },
    message: 'Must have between one and four cell sections per data cell'
  },


  //dataRow validators

  dataCellsMeetsRequiredLength: {
    validator: function(v) {  
      for (let i = 0; i < v.length; i++) {
        if (v[i].dataCells.length === this.header.length) {
          return true
        } else {
          return false
        }
      }
    },
    message: 'Number of cells in a data row must equal that of the header'
  },


  //recurring doc validators

  dataRowsMeetsRequiredLength: {
    validator: function(v) {     
      if (v.length && v.length <= 100) {
        return true
      } else {
        return false
      }
    },
    message: 'Must have between one and 100 data rows'
  }
}
