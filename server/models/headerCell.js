const mongoose = require('mongoose')


const headerCellSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true
  }
})


module.exports = headerCellSchema