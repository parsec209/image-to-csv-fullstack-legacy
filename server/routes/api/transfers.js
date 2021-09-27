const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../../middleware/auth')
const localUpload = require('../../middleware/localUpload')
const { cloudUpload, getData, getZip } = require('../../controllers/transfersController')




/**
 * @swagger
 * /api/transfers/upload:
 *   post:
 *     summary: Uploads file batch to Google Cloud Storage 
 *     tags: 
 *       - transfers
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       description: File batch
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               myFiles: 
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 minItems: 1
 *                 maxItems: 10                
 *             required:
 *               - myFiles
 *     responses:         
 *       '200': 
 *         description: Success - files uploaded to cloud and file batch ID returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileBatchID'
 *       '400':  
 *         description: Error - no files sent (myFiles is either empty or undefined)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '401': 
 *         $ref: '#/components/responses/Unauthenticated'
 *       '415':  
 *         description: Error - wrong file type (must be PDF, TIFF, or GIF)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500':  
 *         description: Error - limit exceeded on either file size or number of files
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/upload', isLoggedIn, localUpload, cloudUpload)  



/**
 * @swagger
 * /api/transfers/extract:
 *   post:
 *     summary: Generates CSV files from the text extracted from the uploaded files
 *     tags: 
 *       - transfers
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       description: Instructions on which file batch, and which pages from each file, to extract
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileBatchID: 
 *                 $ref: '#/components/schemas/FileBatchID'
 *               pageSelections: 
 *                 type: array
 *                 items:
 *                   type: integer
 *                 minItems: 1
 *                 maxItems: 5        
 *               dateToday: 
 *                 type: string 
 *                 format: date
 *                 minLength: 1
 *             required: 
 *               - fileBatchID
 *               - pageSelections
 *               - dateToday
 *     responses:         
 *       '200': 
 *         description: Success - status returned on which files were recognized as recurring documents, and any CSV files that were created are stored in Google Cloud Storage
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 identifiedDocs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BasicString' 
 *                 unidentifiedDocs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BasicString'
 *               required: 
 *                 - identifiedDocs
 *                 - unidentifiedDocs
 *       '400': 
 *         $ref: '#/components/responses/InvalidReq'
 *       '401': 
 *         $ref: '#/components/responses/Unauthenticated'
 *       '500':  
 *         description: Error - none of the page selections match an existing doc page
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/extract', isLoggedIn, getData)  



/**
 * @swagger
 * /api/transfers/write:
 *   post:
 *     summary: Zips the CSV files stored in the cloud
 *     tags: 
 *       - transfers
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       description: File batch ID of the CSV files
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fileBatchID: 
 *                 $ref: '#/components/schemas/FileBatchID'
 *             required: 
 *               - fileBatchID
 *     responses:         
 *       '200': 
 *         description: Success - returns URL for downloading the zip
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               format: uri
 *               minLength: 1
 *       '400': 
 *         $ref: '#/components/responses/InvalidReq'
 *       '401': 
 *         $ref: '#/components/responses/Unauthenticated'
 *       '404':  
 *         description: Error - Unable to create zip file due to either invalid file batch ID or absent CSV files
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/write', isLoggedIn, getZip)  



module.exports = router


