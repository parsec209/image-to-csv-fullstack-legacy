/**
 * CSVGenerator module
 * @module CSVGenerator
 */

const {Storage} = require('@google-cloud/storage')
const storage = new Storage()
const bucket = storage.bucket(process.env.STORAGE_BUCKET)
const getDocText = require('./textExtractor')
const { getWordList, sortWordList } = require('./wordListGenerator')
const CellValueGenerator = require('./cellValueGenerator')
const { getConsolidatedBlueprints, writeCSVFiles } = require('./CSVWriter')
const Doc = require('../models/doc')
const PostService = require('./postService')
const postService = new PostService(Doc)
const { validateArgs, schemas } = require('../util/argsValidator')
const Joi = require('joi')



// @ts-check


/**
 * Parses each document's text to see if it contains one of the recurring document ID phrases 
 * @param {Array<DocText>} docsText - Extracted text from all the docs in the batch
 * @param {Array<Object>} recurringDocs - Mongoose Doc model instances (recurring documents)
 * @returns {MatchedText} - Specifies which uploads contain a recurring doc's ID phrase    
 */
const identifyDocText = function(docsText, recurringDocs) {
  validateArgs(arguments, 
    {
      0: Joi.array().items(schemas.docText),
      1: Joi.array().items(schemas.recurringDoc)
    }
  )
  const matchedDocsText = []
  const unmatchedDocsText = []
  const matchedRecurringDocs = []
  docsText.forEach(function(docText) {
    for (let i = 0; i < recurringDocs.length; i++) {
      let recurringDoc = recurringDocs[i]      
      let idPhraseFound = false
      let idPhrase2Found = false
      for (let i = 0; i < docText.extraction.length; i++) {
        let page = docText.extraction[i]
        if (page.fullTextAnnotation) {
          if (!idPhraseFound && page.fullTextAnnotation.text.includes(recurringDoc.idPhrase)) {
            idPhraseFound = true
          }
          if (recurringDoc.idPhrase2 && !idPhrase2Found && page.fullTextAnnotation.text.includes(recurringDoc.idPhrase2)) {
            idPhrase2Found = true
          }
          if (idPhraseFound && (recurringDoc.idPhrase2 ? idPhrase2Found : true)) {
            matchedRecurringDocs.push({ fileName: docText.fileName, recurringDoc })
            matchedDocsText.push(docText.fileName)
            return
          }
        }
      }
    }
    unmatchedDocsText.push(docText.fileName)
  })
  return { matchedDocsText, unmatchedDocsText, matchedRecurringDocs }
}


/**
 * Process starting at batch image annotation and ending when the generated CSV files are uploaded to GCP storage bucket
 * @param {User} user - User info
 * @param {string} fileBatchID - Batch ID for files
 * @param {Array<number>} pageSelections - Page numbers to scan for this file batch
 * @param {string} dateToday - Today's date (per client)
 * @returns {Promise<{identifiedDocs: Array<string>, unidentifiedDocs: Array<string>}>} - Lists the identified and unidentified filenames in the batch, based on whether they contained a recurring doc ID phrase
 */
const compileData = async function(user, fileBatchID, pageSelections, dateToday) {
  validateArgs(arguments, { 0: schemas.user, 1: schemas.fileBatchID, 2: schemas.pageSelections, 3: Joi.date() })
  const docs = await bucket.getFiles({ directory: `${user._id}/uploads/${fileBatchID}` })
  const docsText = await Promise.all(docs[0].map(async function(doc) {
    return await getDocText(doc, pageSelections)
  }))
  const recurringDocs = await postService.findAll({ 'user.id': user._id })
  let { matchedDocsText, unmatchedDocsText, matchedRecurringDocs } = identifyDocText(docsText, recurringDocs)
  const CSVBlueprints = matchedDocsText.map(matchedDocText => {
    const docText = docsText.find(docText => docText.fileName === matchedDocText)
    const recurringDoc = matchedRecurringDocs.find(matchedRecurringDoc => matchedRecurringDoc.fileName === matchedDocText).recurringDoc
    const wordList = getWordList(docText)
    sortWordList(wordList) 
    const cellValueGenerator = new CellValueGenerator(docText, wordList, recurringDoc, dateToday)
    const CSVBlueprint = cellValueGenerator.getCSVBlueprint()
    return CSVBlueprint
  })
  if (CSVBlueprints.length) {
    const consolidatedBlueprints = getConsolidatedBlueprints(CSVBlueprints)
    await writeCSVFiles(consolidatedBlueprints, user._id, fileBatchID)
  }
  return { identifiedDocs: matchedDocsText, unidentifiedDocs: unmatchedDocsText }
}



module.exports = { identifyDocText, compileData }








