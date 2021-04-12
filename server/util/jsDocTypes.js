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
 * Text extraction for all doc pages along with filename   
 * @typedef {Object} DocText
 * @property {string} fileName - Original filename of extracted doc
 * @property {Array<AnnotateImageResponse>} extraction - Array of all the doc's extracted pages
 */


/**
 * Paragraph object created from text extraction. See {@link https://cloud.google.com/vision/docs/reference/rest/v1/AnnotateImageResponse#Paragraph}
 * @typedef {Object} Paragraph
 */


/**
 * Word object created from text extraction. See {@link https://cloud.google.com/vision/docs/reference/rest/v1/AnnotateImageResponse#Word}
 * @typedef {Object} ParagraphWord 
 */


/**
 * Word within a {@link Line}. Borrows some properties from {@link ParagraphWord}, along with having its own properties. 
 * @typedef {Object} LineWord
 * @property {string} wordText - same symbols (text) from {@link ParagraphWord}
 * @property {Array<{x: number, y: number}>} vertices - same vertices from {@link ParagraphWord}
 * @property {number} startIndex - index of {@link LineText} where wordText begins 
 * @property {number} endIndex - index of {@link LineText} where wordText ends 
 */


/**
 * Vertices within a {@link Line}. Uses the outermost vertices (lowest, highest, leftmost, rightmost) found within its {@link LineWord}s
 * @typedef {Object} LineVertices
 * @property {number} xUpperLeft - upper left x coordinate
 * @property {number} yUpperLeft - upper left y coordinate
 * @property {number} xLowerRight - lower right x coordinate
 * @property {number} yLowerRight - lower right y coordinate
 */


/**
 * Text within a {@link Line}. Combines the text from each {@link LineWord} into a single string.
 * @typedef {string} LineText
 */


 /**
  * Represents a single line of words from a {@link Paragraph}; the words have additional properties added to them, creating {@link LineWord}s
  * @typedef {Object} Line
  * @property {Array<LineWord>} words - The line's words
  * @property {LineVertices} vertices - The line's vertices
  * @property {LineText} text - Combined text from line's words
  */


 /**
  * All lines within a doc page
  * @typedef {Array<Line>} PageLines
  */


 /**
  * All lines within a doc
  * @typedef {Object} DocLines
  * @property {string} fileName - Original filename of extracted doc
  * @property {Array<PageLines>} textLines - Array of {@link PageLines}
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

 

 