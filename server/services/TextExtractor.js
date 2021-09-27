/**
 * textExtractor module
 * @module textExtractor
 */

//This module borrows and modifies parts of the code sample found at https://github.com/googleapis/nodejs-vision/blob/master/samples/batch-annotate-files-gcs.js 

const { validateArgs, schemas } = require('../util/argsValidator')
const { ImageAnnotatorClient } = require('@google-cloud/vision').v1
const client = new ImageAnnotatorClient()
const path = require('path')
const Joi = require('joi')


// @ts-check

 
/**
 * Extract text from document using GCP Vision image annotation
 * @param {CloudFile} doc - Doc file from GCP storage bucket
 * @param {Array<number>} pageSelections - Page numbers to scan for this file batch
 * @returns {Promise<DocText>} - Object containing document text annotations and original filename 
 * @throws {Error} - Operational error when none of the page selections matches an actual doc page in the batch
 */
const getDocText = async function(doc, pageSelections) {
  validateArgs(arguments, { 0: Joi.object(), 1: schemas.pageSelections })
  const inputConfig = {
    // Supported mime_type: application/pdf, image/tiff, image/gif
    mimeType: doc.metadata.contentType,
    gcsSource: {
      uri: `gs://${process.env.STORAGE_BUCKET}/${doc.name}`
    },
  }
  const features = [{type: 'DOCUMENT_TEXT_DETECTION'}]
  const fileRequest = {
    inputConfig,
    features,
    // First page starts at 1, last page starts at -1
    pages: pageSelections,
    imageContext: { 
      // English encoding is specified, since some text within docs such as invoices (i.e. invoice numbers) can be confused as another language
      languageHints: ['en'],
    }
  }
  const request = {
    requests: [fileRequest]
  }
  const [result] = await client.batchAnnotateFiles(request)
  const docText = result.responses[0].responses
  return { fileName: path.basename(doc.name), extraction: docText }
}


module.exports = getDocText