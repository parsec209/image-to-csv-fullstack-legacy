/**
 * Uploader module
 * @module Uploader
 */

const {Storage} = require('@google-cloud/storage')
const storage = new Storage()
const bucket = storage.bucket(process.env.STORAGE_BUCKET)
const checkFileType = require('file-type')
const { validateArgs } = require('../util/ArgsValidator')
const InputError = require('../util/InputError')


// @ts-check


/**
 * Class to create an uploader object
 */
class Uploader {
  /**
   * Create an uploader
   * @param {User} user - User info
   * @param {string} fileBatchID - Batch ID for files
   * @param {Array<LocalFile>} files - Batch of files to be uploaded
   */
  constructor (user, fileBatchID, files) {
    validateArgs(['{username: String,  _id: {toHexString: Function, ...}, ...}', 'String', '[{buffer: Uint8Array, originalname: String, mimetype: String, ...}]'], arguments)
    this.user = user
    this.fileBatchID = fileBatchID
    this.files = files
  }
  

  /**
   * Validate file types using their magic numbers
   * @return {Promise<void>}
   */
  async checkFileFormats() {
    const checkedFiles = this.files.map(async function(file) {
      const fileType = await checkFileType.fromBuffer(file.buffer)
      if (!fileType || !['tif', 'pdf', 'gif'].includes(fileType.ext)) {
        throw new InputError('File format not supported. Accepted file formats: pdf, gif, tif', 400)
      } 
    })
    await Promise.all(checkedFiles)
  }


  /**
   * Upload files to GCP storage bucket 
   * @return {Promise<void>}
   */
  async uploadToCloud() {
    const self = this
    const uploaded = this.files.map(function(file) {
      return new Promise(function(resolve, reject) {
        const blob = bucket.file(`${self.user._id}/uploads/${self.fileBatchID}/${file.originalname}`)
        const blobStream = blob.createWriteStream({ 
          metadata: { contentType: file.mimetype } 
        })
        blobStream.on('finish', function() {
          resolve()
        })
        blobStream.on('error', function(err) {
          reject(err)
        })
        blobStream.end(file.buffer)
      })
    })
    await Promise.all(uploaded)
  }

}


module.exports = Uploader



