const Joi = require('joi')
const InputError = require('../util/inputError')


module.exports.validateArgs = function(args, argSchemas) {
  const schema = Joi.object(argSchemas).length(Object.keys(argSchemas).length)
  const result = schema.validate(args)
  if (result.hasOwnProperty('error')) {
    throw new Error(JSON.stringify(result.error))
  }
}


module.exports.validateReqBody = function(body, bodySchema) {
  const result = Joi.object(bodySchema).validate(body)
  if (result.hasOwnProperty('error')) {
    throw new InputError(`Request body error: ${result.error.details[0].message}`, 400)
  }
  return result.value
}


module.exports.validateReqParams = function(param) {
  const result = Joi.string()
    .pattern(/^[a-z0-9]+$/)
    .validate(param)
  if (result.hasOwnProperty('error')) {
    throw new InputError(`Request paramater error: ${result.error.details[0].message}`, 400)
  }
  return result.value
}


module.exports.schemas = {

  headerCells: Joi.array().items(
    Joi.object({
      _id: Joi.string(),
      value: Joi.string().trim().required()
    })
  ).min(1).max(52).unique((a, b) => a.value === b.value),

  dataRows: Joi.array().items(
    Joi.object({
      _id: Joi.string(),
      dataCells: Joi.array().items(
        Joi.object({
          _id: Joi.string(),
          cellSects: Joi.array().items(
            Joi.object({
              _id: Joi.string(),
              searchOrInputMethod: Joi.any().valid('topPhrase', 'leftPhrase', 'pattern', 'customValue', 'today'),
              phraseCount: Joi.number().integer().min(1).max(100),
              stringType: Joi.any().valid('phrase', 'word'),
              phraseOrValue: Joi.string(),
              appendChars: Joi.string(),
              dateFormat: Joi.string().pattern(/^[-MDY\/ \,]+$/),
              daysAdded: Joi.number().integer().min(0).max(100),
              notes: Joi.string()
            }).required()
          ).min(1).max(4).required()
        }).required()
      ).min(1).max(52).required()
    }).required()
  ).min(1).max(100),

  user: Joi.object({
    username: Joi.string().required()
  }).unknown(), 

  fileBatchID: Joi.string().guid({ 
    version: 'uuidv4' 
  }),

  pageSelections: Joi.array().items(
    Joi.number().integer()
  ).min(1).max(5),

  docText:  Joi.object({
    fileName: Joi.string().required(),
    extraction: Joi.array().items(
      Joi.object({
        fullTextAnnotation: Joi.object({
          pages: Joi.array().required(),
          text: Joi.string().required()
        }).required().allow(null)
      }).required().unknown()
    ).required()
  }),

  word: Joi.object({
    symbols: Joi.array().required(),
    confidence: Joi.number().required()
  }).unknown(),

  wordList: Joi.object({
    fileName: Joi.string().required(),
    words: Joi.array().items(
      Joi.array().required()
    ).required()
  }),

  recurringDoc: Joi.object({
    name: Joi.string().required(),
    idPhrase: Joi.string().required()
  }).unknown(),

  recurringDocCellSect: Joi.object({
    _id: Joi.object().required()
  }).unknown(),

  document: Joi.object({
    name: Joi.string().required(),
    user: Joi.object().required()
  }).unknown(),

  password: Joi.string()
    .pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/)
   
}









