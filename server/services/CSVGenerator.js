/**
 * CSVGenerator module - see {@tutorial CSVGenerator-tutorial}
 * @module CSVGenerator
 */

const {Storage} = require('@google-cloud/storage')
const storage = new Storage()
const bucket = storage.bucket(process.env.STORAGE_BUCKET)
const TextExtractor = require('./TextExtractor')
const TextLineGenerator = require('./TextLineGenerator')
const CellValueGenerator = require('./CellValueGenerator')
const CSVWriter = require('./CSVWriter')
const PostService = require('./PostService')
const Doc = require('../models/doc')
const { validateArgs } = require('../util/ArgsValidator')



// @ts-check


/**
 * Class to create csvGenerator object
 */
class CSVGenerator {
  /**
   * Create csvGenerator 
   * @param {User} user - User info
   * @param {string} IPAddress - Client's IP address
   * @param {string} fileBatchID - Batch ID for files
   * @param {Array<number>} pageSelections - Page numbers to scan for this file batch
   * @param {string} dateToday - Today's date
   */
  constructor (user, IPAddress, fileBatchID, pageSelections, dateToday) {
    validateArgs(['{username: String,  _id: {toHexString: Function, ...}, ...}', 'String', 'String', '[Number]', 'String'], arguments)
    this.user = user
    this.IPAddress = IPAddress
    this.fileBatchID = fileBatchID
    this.pageSelections = pageSelections
    this.dateToday = dateToday
  }


  


  /**
   * Parses each document's text to see if it contains one of the recurring document ID phrases 
   * @param {Array<DocText>} docsText - Extracted text from all the docs in the batch
   * @param {Array<Object>} recurringDocs - Mongoose Doc model instances (recurring documents)
   * @returns {MatchedText} - Filenames of the uploads where ID phrases were found or not found, and the the recurring doc instances that contain those ID phrases   
   */
  identifyDocText(docsText, recurringDocs) {
    validateArgs(['[{fileName: String, extraction: Array}]', '[{_id: Object, name: String, idPhrase: String, header: Array, dataRows: Array, user: Object, ...}]'], arguments)
    const matchedDocsText = []
    const unmatchedDocsText = []
    const matchedRecurringDocs = []
    docsText.forEach(function(docText) {
      for (let i = 0; i < docText.extraction.length; i++) {
        let page = docText.extraction[i]
        for (let i = 0; i < recurringDocs.length; i++) {
          let recurringDoc = recurringDocs[i]
          if (page.fullTextAnnotation && page.fullTextAnnotation.text.includes(recurringDoc.idPhrase)) {
            matchedRecurringDocs.push({ fileName: docText.fileName, recurringDoc })
            matchedDocsText.push(docText.fileName)
            return
          }          
        }
      }
      unmatchedDocsText.push(docText.fileName)
    })
    return { matchedDocsText, unmatchedDocsText, matchedRecurringDocs }
  }


  /**
   * Process starting at file batch text extraction and ending when CSV files are uploaded to GCP storage bucket
   * @returns {Promise<{identifiedDocs: Array<string>, unidentifiedDocs: Array<string>}>} - Lists the filenames in the batch that were both identified and not identified using recurring doc ID phrases
   */
  async compileData() {
    const self = this
    const docs = await bucket.getFiles({ directory: `${this.user._id}/uploads/${this.fileBatchID}` })
    const docsText = await Promise.all(docs[0].map(async function(doc) {
      const textExtractor = new TextExtractor(doc, self.pageSelections)
      return await textExtractor.getDocText()
    }))
    const postService = new PostService(Doc)
    const recurringDocs = await postService.findAll({ 'user.id': this.user._id })
    let { matchedDocsText, unmatchedDocsText, matchedRecurringDocs } = this.identifyDocText(docsText, recurringDocs)
    const CSVBlueprints = matchedDocsText.map(matchedDocText => {
      const docText = docsText.find(docText => docText.fileName === matchedDocText)
      const recurringDoc = matchedRecurringDocs.find(matchedRecurringDoc => matchedRecurringDoc.fileName === matchedDocText).recurringDoc
      const textLineGenerator = new TextLineGenerator(docText)
      const docTextLines = textLineGenerator.getDocLines()
      textLineGenerator.sortDocLines(docTextLines) 
      const cellValueGenerator = new CellValueGenerator(docText, docTextLines, recurringDoc, self.dateToday)
      const CSVBlueprint = cellValueGenerator.getCSVBlueprint()
      return CSVBlueprint
    })
    if (CSVBlueprints.length) {
      const csvWriter = new CSVWriter(this.user._id, this.fileBatchID, CSVBlueprints)
      const consolidatedBlueprints = csvWriter.getConsolidatedBlueprints()
      await csvWriter.writeCSVFiles(consolidatedBlueprints)
    }
    return { identifiedDocs: matchedDocsText, unidentifiedDocs: unmatchedDocsText }
  }
}

module.exports = CSVGenerator











