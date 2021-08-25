/**
 * Database User instance ID. See {@link https://mongoosejs.com/docs/schematypes.html#objectids}
 * @typedef {Object} UserID
 */


/**
 * Database User instance. See {@link https://mongoosejs.com/docs/documents.html}
 * @typedef {Object} User
 * @property {UserID} _id - User ID
 * @property {string} username -  User's username
 * @property {string} email - User's email address
 * @property {string} salt - Salt value
 * @property {string} hash - Hashed password
 * @property {number} __v - Version key
 */


/**
 * Object created by multer from local storage file. See {@link https://www.npmjs.com/package/multer#api}
 * @typedef {Object} LocalFile
 */


/**
 * File object from GCP storage bucket. See {@link https://googleapis.dev/nodejs/storage/4.7.0/File.html} 
 * @typedef {Object} CloudFile
 */


/**
 * Object created from GCP's text extraction of a doc page. See {@link https://cloud.google.com/vision/docs/reference/rest/v1/AnnotateImageResponse}
 * @typedef {Object} AnnotateImageResponse 
 */


/**
 * Text extraction of all doc pages along with filename   
 * @typedef {Object} DocText
 * @property {string} fileName - Original filename of extracted doc
 * @property {Array<AnnotateImageResponse>} extraction - Array of all the doc's extracted pages
 */


/**
 * Word object from {@link AnnotateImageResponse}. See {@link https://cloud.google.com/vision/docs/reference/rest/v1/AnnotateImageResponse#Word}
 * @typedef {Object} AnnotateImageResponseWord 
 */

 
/**
 * List of {@link AnnotateImageResponseWord}s for each doc page, along with filename
 * @typedef {Object} WordList 
 * @property {string} fileName - Original filename of extracted doc
 * @property {Array<Array<AnnotateImageResponseWord>>} words - Two dimensional array of the doc's words, grouped by page
 */


/**
 * Anchor phrase indeces
 * @typedef {Object} AnchorPhraseIndeces
 * @property {number} pageIndex - doc index of the page containing the anchor phrase
 * @property {number} startWordIndex - page index of the first word containing the anchor phrase
 * @property {number} startSymbolIndex - word index of the first symbol containing the anchor phrase
 * @property {number} endWordIndex - page index of the last word containing the anchor phrase
 * @property {number} endSymbolIndex - word index of the last symbol containing the anchor phrase
 */


/**
 * Lists the filenames of the uploads that have, and do not have, an ID phrase within their text that matches a recurring doc. Also lists any recurring doc instances that contain those matching ID phrases.
 * @typedef {Object} MatchedText 
 * @property {Array<string>} matchedDocsText - Filenames of uploads with a matching ID phrase
 * @property {Array<string>} unmatchedDocsText - Filenames of uploads with no matching ID phrase
 * @property {Array<{fileName: string, recurringDoc: Object}>} matchedRecurringDocs - Recurring doc instances that contain a matching ID phrase (if applicable), along with the filename of the upload that matches
 */


 /**
  * Contains header row cell values for the CSV file. See {@link https://www.npmjs.com/package/csv-writer#api}
  * @typedef {Array<{id: string, title: string}>} Header
  */


 /**
  * An object containing all the data for the CSV file, in addition to the filename where the text originated
  * @typedef {Object} CSVBlueprint
  * @property {string} fileName - Filename of the upload from which the extracted text originated
  * @property {Header} CSVHeader - Header 
  * @property {Array<Object>} CSVDataRows - Data rows
  */

 
 /**
  * Object used to write CSV file
  * @typedef {Object} consolidatedBlueprint
  * @property {Array<{id: string, title: string}>} header - Header cell values
  * @property {Array<Object>} dataRows - Data cell values 
  */

 

 