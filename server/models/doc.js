const mongoose = require('mongoose')
const headerCellSchema = require('./headerCell')
const util = require('../util/PostValidator')


const cellSectSchema = new mongoose.Schema({
  searchOrInputMethod: {
    type: String,
    enum: ['topPhrase', 'leftPhrase', 'pattern', 'customValue', 'today']
  }, 
  phraseCount: {
    type: Number,
    min: 1,
    max: 99, 
    default: 1,
    validate: [util.phraseCountIsInteger]   
  },
  stringType: {
    type: String,
    enum: ['phrase', 'word'],
    default: 'phrase'
  },
  phraseOrValue: {
    type: String,
    max: 100,    
    required: function() {
      return ['topPhrase', 'leftPhrase', 'pattern', 'customValue'].includes(this.searchOrInputMethod)
    },
    validate: [util.searchOrInputMethodIsDefined, util.searchOrInputMethodIsNotToday]
  },
  appendChars: {
    type: String,
    validate: [util.searchOrInputMethodIsDefined]            
  },
  dateFormat: {
    type: String,
    validate: [util.searchOrInputMethodIsDefined, util.dateFormatContainsValidChars]
  },   
  daysAdded: {
    type: Number,
    min: 0,
    max: 100, 
    validate: [util.daysAddedIsInteger]   
  },
  notes: {
    type: String
  }
})


const dataCellSchema = new mongoose.Schema({
  cellSects: {
    type: [cellSectSchema],
    required: true,
    validate: [util.cellSectsMeetsRequiredLength]
  },
})


const dataRowSchema = new mongoose.Schema({
  dataCells: { 
    type: [dataCellSchema],
    required: true
  }
})


//recurring doc
const docSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100,
  }, 
  idPhrase: {
    type: String,
    required: true,
    maxlength: 100,
  },
  idPhrase2: {
    type: String,
    maxlength: 100
  },
  header: {
    type: [headerCellSchema],
    required: true,
    validate: [util.headerHasNoDuplicates, util.headerMeetsRequiredLength]
  },
  dataRows: {
    type: [dataRowSchema],
    required: true,
    validate: [util.dataCellsMeetsRequiredLength, util.dataRowsMeetsRequiredLength]
  },
  user: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }
})


module.exports = mongoose.model('Doc', docSchema)


