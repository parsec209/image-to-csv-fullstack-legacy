/**
 * CSVWriter module
 * @module CSVWriter
 */

const createCSVStringifier = require('csv-writer').createObjectCsvStringifier
const {Storage} = require('@google-cloud/storage')
const storage = new Storage()
const bucket = storage.bucket(process.env.STORAGE_BUCKET)
const { validateArgs } = require('../util/ArgsValidator')


// @ts-check


/**
 * Class to create csvWriter object
 */
class CSVWriter {
  /**
   * Create csvWriter
   * @param {UserID} userID - User ID
   * @param {string} fileBatchID - Batch ID for files
   * @param {Array<CSVBlueprint>} CSVBlueprints - Array of CSV blueprints
   */
  constructor (userID, fileBatchID, CSVBlueprints) {
    validateArgs(['{toHexString: Function, ...}', 'String', '[{fileName: String, CSVHeader: Array, CSVDataRows: Array}]'], arguments)
    this.userID = userID
    this.fileBatchID = fileBatchID
    this.CSVBlueprints = CSVBlueprints
  }


  /**
   * Prepares blueprints to be writeable to CSV file/s. If any blueprints contain identical headers, their data rows are consolidated into one object
   * @returns {Array<consolidatedBlueprint>} - Array of CSV-writeable blueprints
   */
  getConsolidatedBlueprints() {
    const consolidatedBlueprints = []
    this.CSVBlueprints.forEach(CSVBlueprint => {
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
   * @param {Array<consolidatedBlueprint>} consolidatedBlueprints - Array of CSV-writeable blueprints
   * @returns {Promise<void>}
   */
  async writeCSVFiles(consolidatedBlueprints) {
    validateArgs(['[{header: Array, dataRows: Array}]'], arguments)
    const self = this
    const filesWritten = consolidatedBlueprints.map(function(blueprint, fileNumber) {
      const CSVStringifier = createCSVStringifier({
        header: blueprint.header
      })
      const header = CSVStringifier.getHeaderString()
      const dataRows = CSVStringifier.stringifyRecords(blueprint.dataRows)
      return new Promise((resolve, reject) => {
        const blob = bucket.file(`${self.userID}/downloads/${self.fileBatchID}/${fileNumber}.csv`)
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
    })
    await Promise.all(filesWritten)
  }
}


module.exports = CSVWriter
















