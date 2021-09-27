/**
 * CSVWriter module
 * @module CSVWriter
 */

const createCSVStringifier = require('csv-writer').createObjectCsvStringifier
const {Storage} = require('@google-cloud/storage')
const storage = new Storage()
const bucket = storage.bucket(process.env.STORAGE_BUCKET)
const { validateArgs, schemas } = require('../util/argsValidator')
const Joi = require('joi')


// @ts-check


/**
 * Prepares blueprints to be writeable to CSV files. If any blueprints contain identical headers, their data rows are consolidated into the same blueprint
 * @param {Array<CSVBlueprint>} CSVBlueprints - Array of CSV blueprints
 * @returns {Array<ConsolidatedBlueprint>} - Array of blueprints formatted for the csv-writer
 */
const getConsolidatedBlueprints = function(CSVBlueprints) {
  validateArgs(arguments, 
    {
      0: Joi.array().items(
        Joi.object({
          fileName: Joi.string().required(),
          CSVHeader: Joi.array().required(),
          CSVDataRows: Joi.array().required()
        }).required()
      )
    }
  )
  const consolidatedBlueprints = []
  CSVBlueprints.forEach(CSVBlueprint => {
    for (let i = 0; i < consolidatedBlueprints.length; i++) { 
      if (JSON.stringify(CSVBlueprint.CSVHeader) === JSON.stringify(consolidatedBlueprints[i].header)) {
        consolidatedBlueprints[i].dataRows.push(...CSVBlueprint.CSVDataRows)
        return
      }
    }
    consolidatedBlueprints.push({
      header: CSVBlueprint.CSVHeader,
      dataRows: CSVBlueprint.CSVDataRows
    }) 
  })
  return consolidatedBlueprints
}


/**
 * Writes CSV files and uploads them to GCP storage bucket
 * @param {Array<ConsolidatedBlueprint>} consolidatedBlueprints - Array of CSV-writeable blueprints
 * @param {UserID} userID - User ID
 * @param {string} fileBatchID - Batch ID for files
 * @returns {Promise<void>}
 * @throws {Error} - Unexpected error during stream
 */
const writeCSVFiles = async function(consolidatedBlueprints, userID, fileBatchID) {
  validateArgs(arguments, 
    {
      0: Joi.array().items(
        Joi.object({
          header: Joi.array().required(),
          dataRows: Joi.array().required()
        }).required()
      ),

      1: Joi.object({
        toHexString: Joi.function().required()
      }).unknown(),

      2: schemas.fileBatchID
    }
  )
  await Promise.all(consolidatedBlueprints.map(function(blueprint, fileNumber) {
    const CSVStringifier = createCSVStringifier({
      header: blueprint.header
    })
    const header = CSVStringifier.getHeaderString()
    const dataRows = CSVStringifier.stringifyRecords(blueprint.dataRows)
    return new Promise((resolve, reject) => {
      const blob = bucket.file(`${userID}/downloads/${fileBatchID}/${fileNumber}.csv`)
      const blobStream = blob.createWriteStream(
        { 
          metadata: {
            contentType: 'text/csv'
          }
        }
      )
      blobStream.on('finish', () => {
        resolve()
      })
      blobStream.on('error', err => {
        reject(err)
      })
      blobStream.end(header + dataRows)
    })
  }))
}



module.exports = { getConsolidatedBlueprints, writeCSVFiles }
















