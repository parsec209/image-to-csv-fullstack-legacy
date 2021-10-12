/**
 * uploader module
 * @module uploader
 */

const {Storage} = require('@google-cloud/storage')
const storage = new Storage()
const bucket = storage.bucket(process.env.STORAGE_BUCKET)
const checkFileType = require('file-type')
const { validateArgs, schemas } = require('../util/argsValidator')
const InputError = require('../util/inputError')
const Joi = require('joi')



//@ts-check


/**
 * Class to create an uploader object
 */
class Uploader {
  /**
   * Create an uploader
   * @param {Array<LocalFile>} files - Batch of files to be uploaded
   */
  constructor (files) {
    validateArgs(arguments, 
      {
        0: Joi.array().items(
          Joi.object({
            originalname: Joi.string().required()
          }).unknown().required()
        )
      }
    )
    this.files = files
  }
  

  /**
   * Validate file types using their magic numbers
   * @return {Promise<void>}
   * @throws {InputError} - If file is not TIF, PDF, or GIF
   */
  async checkFileFormats() {
    await Promise.all(this.files.map(async function(file) {
      const fileType = await checkFileType.fromBuffer(file.buffer)
      if (!fileType || !['tif', 'pdf', 'gif'].includes(fileType.ext)) {
        throw new InputError('File format not supported. Accepted file formats: pdf, gif, tif', 415)
      } 
    }))
  }


  /**
   * Upload files to GCP storage bucket 
   * @param {User} user - User info
   * @param {string} fileBatchID - Batch ID for files
   * @return {Promise<void>}
   * @throws {Error} - Unexpected error during stream
   */
  async uploadToCloud(user, fileBatchID) {
    validateArgs(arguments, { 0: schemas.user, 1: schemas.fileBatchID })
    await Promise.all(this.files.map(function(file) {
      return new Promise(function(resolve, reject) {
        const blob = bucket.file(`${user._id}/${fileBatchID}/uploads/${file.originalname}`)
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
    }))
  }

}


module.exports = Uploader

