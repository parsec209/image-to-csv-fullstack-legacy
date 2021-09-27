const mongoose = require('mongoose')
const headerCellSchema = require('./headerCell')
const { headerHasNoDuplicates, headerMeetsRequiredLength } = require('../util/postValidator')


const headerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxLength: 100
  }, 
  cells: {
    type: [headerCellSchema],
    required: true,
    validate: [headerHasNoDuplicates, headerMeetsRequiredLength]
  },
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }
})

module.exports = mongoose.model('Header', headerSchema)
