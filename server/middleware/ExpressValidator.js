const { body, validationResult } = require('express-validator')
const InputError = require('../util/InputError')
const typeCheck = require('type-check').typeCheck


//Validates and sanitizes data in the HTTP request body
//Some of the inputs require database validation as well, see ../models/user.js  and ../util/PostValidator.js



module.exports = {


  username:
    body('username')
      .isString()
      .trim()
      .withMessage('Missing string in request body: username'),


  email:
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Must include a valid email address in request body'),


  password:
    body('password')
    .isString()
      .withMessage('Missing string in request body: password'),


  confirmedPassword:
    body('confirmedPassword')
      .isString()
      .withMessage('Missing string in request body: confirmedPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new InputError('Password and confirmed password must match', 400)
        }
        return true
      }),


  oldPassword:
    body('oldPassword')
      .isString()
      .withMessage('Missing string in request body: oldPassword')
      .custom((value, { req }) => {
        if (value === req.body.password) {
          throw new InputError('New password must be different from current password', 400)
        }
        return true
      }),
  

  fileBatchID:
    body('fileBatchID')
      .isUUID()
      .withMessage('fileBatchID must be a valid UUID'),


  pageSelections:   
    body('pageSelections')
      .custom(value => {
        if (!typeCheck('[Number]', value) || !value.length) {
          throw new InputError('pageSelections must be an array containing one or more numbers', 400)
        }
        return true
      }),


  dateToday:   
    body('dateToday')
      .isDate() //defaults to YYYY/MM/DD
      .withMessage('dateToday must be a valid date formatted as YYYY/MM/DD'),


  cells:
    body('cells')
      .custom(value => {
        if (!typeCheck('[{_id: Maybe String, value: String}]', value)) {
          throw new InputError('cells must be an array containing one or more objects formatted as { "_id": "string", "value": "string" } (_id is optional)', 400)
        } else {
          return true
        }
      })
      .bail()
      .customSanitizer(value => {
        value.forEach((cell, index, cells) => {
          cells[index]['value'] = cells[index]['value'].trim()
        });
        return value
      }),


  name: 
    body('name')
      .isString()
      .trim()
      .withMessage('Missing string in request body: name'),

  
  idPhrase:
    body('idPhrase')
      .isString()
      .trim()
      .withMessage('Missing string in request body: idPhrase'),
       

  header:    
    body('header')
      .custom(value => {
        if (!typeCheck('[{_id: Maybe String, value: String}]', value)) {
          throw new InputError('header must be an array containing one or more objects formatted as { "_id": "string", "value": "string" } (_id is optional)', 400)
        }
        return true
      })
      .bail()
      .customSanitizer(value => {
        value.forEach((cell, index, cells) => {
          cells[index]['value'] = cells[index]['value'].trim()
        });
        return value
      }),


  dataRows:    
    body('dataRows')
      .custom(value => {
        if (!typeCheck('[{_id: Maybe String, dataCells: [{_id: Maybe String, cellSects: [Object]}]}]', value)) {
          throw new InputError('dataRows must be an array containing one or more objects formatted as { "_id": "string", "dataCells": [{ "_id": "string", "cellSects": [Object] }]} (_id is optional)', 400)
        }
        return true
      })
      .bail()
      .customSanitizer(value => {
        value.forEach(row => {
          row.dataCells.forEach(cell => {
            cell.cellSects.forEach((cellSect, index, cellSects) => {
              if (cellSects[index]['phraseOrValue']) {
                cellSects[index]['phraseOrValue'] = cellSects[index]['phraseOrValue'].trim()
              }
            })
          })
        })
        return value
      }),
  

  ExpressValidation: (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) { 
      const msgList = errors.array().map(err => err.msg)
      const msgs = msgList.join('. ')
      return next(new InputError(msgs, 400))
    }
    return next()
  } 
}