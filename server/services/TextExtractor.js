
//THIS MODULE MODIFIES PARTS OF THE "batchAnnotateFiles" FUNCTION FOUND AT 
//https://github.com/googleapis/nodejs-vision/blob/master/samples/batch-annotate-files-gcs.js 

//HERE ARE THE LINE NUMBERS CONTAINING THE MODIFICATIONS: 

// LINE 67: CHANGED FUNCTION NAME FROM "batchAnnotateFiles" TO "getDocText"
// LINE 72: CHANGED MIMETYPE VALUE
// LINE 74: CHANGED URI VALUE
// LINE 92: CHANGED PAGES VALUE
// LINES 93: INSERTED IMAGECONTEXT 
// LINE 111: INSERTED RETURN STATEMENT
  

//COPYRIGHT AND LICENSE INFO FROM THE BORROWED CODE SAMPLE: 

// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.



/**
 * TextExtractor module
 * @module TextExtractor
 */


const { validateArgs } = require('../util/ArgsValidator')
const { ImageAnnotatorClient } = require('@google-cloud/vision').v1
const client = new ImageAnnotatorClient()
const path = require('path')

// @ts-check


/**
 * Class to create a textExtractor object
 */
class TextExtractor {
  /**
   * Creates a textExtractor
   * @param {CloudFile} doc - Doc file from GCP storage bucket
   * @param {Array<number>} pageSelections - Page numbers to scan for this file batch
   */
  constructor (doc, pageSelections) {
    validateArgs(['Object', '[Number]'], arguments)
    this.doc = doc
    this.pageSelections = pageSelections
  }


  /**
   * Extract text from doc using GCP Vision API
   * @returns {Promise<DocText>} - Document text annotations with original filename 
   */
  async getDocText() {
    // First Specify the input config with the file's uri and its type.
    // Supported mime_type: application/pdf, image/tiff, image/gif
    // https://cloud.google.com/vision/docs/reference/rpc/google.cloud.vision.v1#inputconfig
    const inputConfig = {
      mimeType: this.doc.metadata.contentType,
      gcsSource: {
        uri: `gs://${process.env.STORAGE_BUCKET}/${this.doc.name}`
      },
    }

    // Set the type of annotation you want to perform on the file
    // https://cloud.google.com/vision/docs/reference/rpc/google.cloud.vision.v1#google.cloud.vision.v1.Feature.Type
    const features = [{type: 'DOCUMENT_TEXT_DETECTION'}]

    // Build the request object for that one file. Note: for additional files you have to create
    // additional file request objects and store them in a list to be used below.
    // Since we are sending a file of type `application/pdf`, we can use the `pages` field to
    // specify which pages to process. The service can process up to 5 pages per document file.
    // https://cloud.google.com/vision/docs/reference/rpc/google.cloud.vision.v1#google.cloud.vision.v1.AnnotateFileRequest
    const fileRequest = {
      inputConfig: inputConfig,
      features: features,
      // Annotate the first two pages and the last one (max 5 pages)
      // First page starts at 1, and not 0. Last page is -1.
      pages: this.pageSelections,
      imageContext: { 
        // English encoding
        languageHints: ['en'],
      }
    }

    // Add each `AnnotateFileRequest` object to the batch request.
    const request = {
      requests: [fileRequest]
    }

    // Make the synchronous batch request.
    const [result] = await client.batchAnnotateFiles(request)

    // Process the results, just get the first result, since only one file was sent in this
    // sample.
    const docText = result.responses[0].responses

    return { fileName: path.basename(this.doc.name), extraction: docText }
  }
}

module.exports = TextExtractor