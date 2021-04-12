const mongoose = require('mongoose')
const headerCellSchema = require('./headerCell')
const { headerHasNoDuplicates, headerMeetsRequiredLength } = require('../util/PostValidator')


const headerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true 
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
