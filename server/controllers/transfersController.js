const Uploader = require('../services/Uploader')
const CSVGenerator = require('../services/CSVGenerator')
const ZipWriter = require('../services/ZipWriter')
const { v4: uuidv4 } = require('uuid')



module.exports = {


  cloudUpload: async (req, res, next) => {
    const user = req.user
    const files = req.files
    const fileBatchID = uuidv4()
    const IPAddress = req.ip
    try {
      const uploader = new Uploader(user, IPAddress, fileBatchID, files) 
      await uploader.checkFileFormats()
      await uploader.uploadToCloud()
      return res.json(fileBatchID)
    } catch (err) { 
      return next(err)
    }
  },


  getData: async (req, res, next) => {
    const user = req.user
    const IPAddress = req.ip
    const { fileBatchID, pageSelections, dateToday } = req.body
    try {
      const csvGenerator = new CSVGenerator(user, IPAddress, fileBatchID, pageSelections, dateToday)
      const status = await csvGenerator.compileData()
      return res.json(status)
    } catch (err) {
      return next(err)  
    }
  },


  getZip: async (req, res, next) => {
    const fileBatchID = req.body.fileBatchID
    const user = req.user
    const IPAddress = req.ip
    try {
      const zipWriter = new ZipWriter(user, IPAddress, fileBatchID)
      await zipWriter.createZip()
      const zipURL = await zipWriter.getURL()
      return res.json(zipURL)
    } catch (err) { 
      return next(err)
    }
  }

}
 






