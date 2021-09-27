const express = require('express')
const router  = express.Router()
const { isLoggedIn, isUserDoc } = require('../../middleware/auth')
const { getDocs, postDoc, getDoc, editDoc, deleteDoc } = require('../../controllers/docsController')




/**
 * @swagger
 * /api/docs/:
 *   get:
 *     summary: Gets all docs for user
 *     tags: 
 *       - docs
 *     security:
 *       - cookieAuth: []
 *     responses:         
 *       '200': 
 *         description: Success - returns docs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RecurringDoc'
 *       '401': 
 *         $ref: '#/components/responses/Unauthenticated'
 */
router.get('/', isLoggedIn, getDocs)  



/**
 * @swagger
 * /api/docs/{id}:
 *   get:
 *     summary: Gets a specific user doc
 *     tags: 
 *       - docs
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       $ref: '#/components/parameters/ID'
 *     responses:         
 *       '200': 
 *         description: Success - returns doc
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecurringDoc'
 *       '400': 
 *         $ref: '#/components/responses/InvalidReq'
 *       '401': 
 *         $ref: '#/components/responses/Unauthenticated'
 *       '403': 
 *         $ref: '#/components/responses/Unauthorized'
 *       '404': 
 *         $ref: '#/components/responses/NotFound'
 *       '500': 
 *         $ref: '#/components/responses/CastFailed'
 */
router.get('/:id', isLoggedIn, isUserDoc, getDoc)



/**
 * @swagger
 * /api/docs/:
 *   post:
 *     summary: Posts a doc
 *     tags: 
 *       - docs
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       description: Recurring document properties
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 $ref: '#/components/schemas/BasicMaxString'
 *               idPhrase:
 *                 $ref: '#/components/schemas/BasicMaxString'
 *               idPhrase2:
 *                 $ref: '#/components/schemas/BasicMaxString'
 *               header:
 *                 $ref: '#/components/schemas/HeaderCells'
 *               dataRows:
 *                 $ref: '#/components/schemas/DataRows'
 *             required: 
 *               - name
 *               - idPhrase
 *               - header
 *               - dataRows
 *     responses:         
 *       '200': 
 *         description: Success - returns the posted doc
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecurringDoc'
 *       '400': 
 *         $ref: '#/components/responses/InvalidReq'
 *       '401': 
 *         $ref: '#/components/responses/Unauthenticated'
 *       '500': 
 *         description: Error - possible duplicate document name, duplicate ID phrase, or post validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', isLoggedIn, postDoc)



/**
 * @swagger
 * /api/docs/{id}:
 *   put:
 *     summary: Updates a doc
 *     tags: 
 *       - docs
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/ID'
 *     requestBody:
 *       required: true
 *       description: Recurring document properties, which will overwrite current properties 
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 $ref: '#/components/schemas/BasicMaxString'
 *               idPhrase:
 *                 $ref: '#/components/schemas/BasicMaxString'
 *               idPhrase2:
 *                 $ref: '#/components/schemas/BasicMaxString'
 *               header:
 *                 $ref: '#/components/schemas/HeaderCells'
 *               dataRows:
 *                 $ref: '#/components/schemas/DataRows'
 *             required: 
 *               - name
 *               - idPhrase
 *               - header
 *               - dataRows
 *     responses:         
 *       '200': 
 *         description: Success - returns the updated doc
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecurringDoc'
 *       '400': 
 *         $ref: '#/components/responses/InvalidReq'
 *       '401': 
 *         $ref: '#/components/responses/Unauthenticated'
 *       '403': 
 *         $ref: '#/components/responses/Unauthorized'
 *       '404': 
 *         $ref: '#/components/responses/NotFound'
 *       '500': 
 *         description: Error - possible duplicate document name, duplicate ID phrase, cast failure for req param or object ID, or post validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', isLoggedIn, isUserDoc, editDoc)



/**
 * @swagger
 * /api/docs/{id}:
 *   delete:
 *     summary: Deletes a doc
 *     tags: 
 *       - docs
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       $ref: '#/components/parameters/ID'
 *     responses:         
 *       '200': 
 *         description: Success - returns the deleted doc
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecurringDoc'
 *       '400': 
 *         $ref: '#/components/responses/InvalidReq'
 *       '401': 
 *         $ref: '#/components/responses/Unauthenticated'
 *       '403': 
 *         $ref: '#/components/responses/Unauthorized'
 *       '404': 
 *         $ref: '#/components/responses/NotFound'
 *       '500': 
 *         $ref: '#/components/responses/CastFailed'
 */
router.delete('/:id', isLoggedIn, isUserDoc, deleteDoc)



module.exports = router

