/**
 * zipWriter module
 * @module zipWriter
 */

const {Storage} = require('@google-cloud/storage')
const storage = new Storage()
const bucket = storage.bucket(process.env.STORAGE_BUCKET)
const zipBucket = require('zip-bucket')(storage)
const { validateArgs, schemas } = require('../util/argsValidator')
const Joi = require('joi')
const InputError = require('../util/inputError')


// @ts-check


/**
 * Class to create a zipWriter object
 */
class ZipWriter {
  /**
   * Create a zipWriter
   * @param {User} user - User info
   * @param {string} fileBatchID - Batch ID for files
   */
  constructor (user, fileBatchID) {  
    validateArgs(arguments, { 0: schemas.user, 1: schemas.fileBatchID } )
    this.user = user
    this.fileBatchID = fileBatchID
  }


  /**
   * Creates a zip file in GCP storage bucket containing the generated CSV files 
   * @returns {Promise<Object>} - see {@link https://www.npmjs.com/package/zip-bucket#promise-resolution}
   * @throws {InputError} - Cannot create zip due to invalid file batch ID or lack of CSV files
   */
  async createZip() {
    const results = await zipBucket({ 
      fromBucket: process.env.STORAGE_BUCKET, 
      fromPath: `${this.user._id}/downloads/${this.fileBatchID}`, 
      toBucket: process.env.STORAGE_BUCKET, 
      toPath: `${this.user._id}/downloads/${this.fileBatchID}/CSVFiles.zip`  
    })
    if (!results.manifest.length) {
      throw new InputError('Unable to create zip file due to either file batch ID or CSV files not existing', 404)
    }
    return results
  }
  

  /**
   * Gets the temporary URL for downloading the zip file
   * @returns {Promise<string>} - URL
   */
  async getURL() {
    const file = bucket.file(`${this.user._id}/downloads/${this.fileBatchID}/CSVFiles.zip`) 
    //url expires in 30 seconds
    const expireDate = new Date().getTime() + 30000
    const url = await file.getSignedUrl({
      action: 'read',
      expires: expireDate  
    })
    return url[0]
  }
}


module.exports = ZipWriter