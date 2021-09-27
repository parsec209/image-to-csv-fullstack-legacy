const Uploader = require('../services/uploader')
const CSVGenerator = require('../services/CSVGenerator')
const ZipWriter = require('../services/zipWriter')
const { v4: uuidv4 } = require('uuid')
const Joi = require('joi')
const { validateReqBody, schemas } = require('../util/argsValidator')



module.exports = {


  cloudUpload: async (req, res, next) => {
    try {
      const user = req.user
      const files = req.files
      const fileBatchID = uuidv4()
      const uploader = new Uploader(files) 
      await uploader.checkFileFormats()
      await uploader.uploadToCloud(user, fileBatchID)
      return res.json(fileBatchID)
    } catch (err) { 
      return next(err)
    }
  },


  getData: async (req, res, next) => {
    try {
      const user = req.user
      const { fileBatchID, pageSelections } = validateReqBody(req.body, 
        {
          fileBatchID: schemas.fileBatchID.required(),
          pageSelections: schemas.pageSelections.required(),
          dateToday: Joi.date().required()
        }
      )
      //keep dateToday input as a string, but ok to validate as a date
      const dateToday = req.body.dateToday
      const status = await CSVGenerator.compileData(user, fileBatchID, pageSelections, dateToday)
      return res.json(status)
    } catch (err) {
      return next(err)  
    }
  },


  getZip: async (req, res, next) => {
    try {
      const user = req.user
      const { fileBatchID } = validateReqBody(req.body, { fileBatchID: schemas.fileBatchID.required() })
      const zipWriter = new ZipWriter(user, fileBatchID)
      await zipWriter.createZip()
      const zipURL = await zipWriter.getURL()
      return res.json(zipURL)
    } catch (err) { 
      return next(err)
    }
  }

}
 






