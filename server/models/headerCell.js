const mongoose = require('mongoose')


const headerCellSchema = new mongoose.Schema({
  value: {
    type: String,
    trim: true,
    required: true,
    maxLength: 100
  }
})


module.exports = headerCellSchema