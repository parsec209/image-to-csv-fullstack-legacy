/**
 * ZipWriter module
 * @module ZipWriter
 */

const {Storage} = require('@google-cloud/storage')
const storage = new Storage()
const bucket = storage.bucket(process.env.STORAGE_BUCKET)
const zipBucket = require('zip-bucket')(storage)
const { validateArgs } = require('../util/ArgsValidator')


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
    validateArgs(['{username: String,  _id: {toHexString: Function, ...}, ...}', 'String'], arguments)    
    this.user = user
    this.fileBatchID = fileBatchID
  }


  /**
   * Creates a zip file in GCP storage bucket containing the generated CSV files 
   * @returns {Promise<Object>} - see {@link https://www.npmjs.com/package/zip-bucket#promise-resolution}
   */
  async createZip() {
    const results = await zipBucket({ 
      fromBucket: process.env.STORAGE_BUCKET, 
      fromPath: `${this.user._id}/downloads/${this.fileBatchID}`, 
      toBucket: process.env.STORAGE_BUCKET, 
      toPath: `${this.user._id}/downloads/${this.fileBatchID}/CSVFiles.zip`  
    })
    if (!results.manifest.length) {
      throw new Error('Error creating zip file')
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