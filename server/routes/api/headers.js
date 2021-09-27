const express = require('express')
const router  = express.Router()
const { isLoggedIn, isUserHeader } = require('../../middleware/auth')
const { getHeaders, postHeader, getHeader, editHeader, deleteHeader } = require('../../controllers/headersController')




/**
 * @swagger
 * /api/headers/:
 *   get:
 *     summary: Gets all headers for user
 *     tags: 
 *       - headers
 *     security:
 *       - cookieAuth: []
 *     responses:         
 *       '200': 
 *         description: Success - returns headers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Header'
 *       '401': 
 *         $ref: '#/components/responses/Unauthenticated'
 */
router.get('/', isLoggedIn, getHeaders)  



/**
 * @swagger
 * /api/headers/{id}:
 *   get:
 *     summary: Gets a specific user header
 *     tags: 
 *       - headers
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       $ref: '#/components/parameters/ID'
 *     responses:         
 *       '200': 
 *         description: Success - returns header
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Header'
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
router.get('/:id', isLoggedIn, isUserHeader, getHeader)



/**
 * @swagger
 * /api/headers/:
 *   post:
 *     summary: Posts a header
 *     tags: 
 *       - headers
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       description: Header name and cell values
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: 
 *                 $ref: '#/components/schemas/BasicMaxString'
 *               cells: 
 *                 $ref: '#/components/schemas/HeaderCells'
 *             required:
 *               - name
 *               - cells
 *     responses:         
 *       '200': 
 *         description: Success - returns the posted header
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Header'
 *       '400': 
 *         $ref: '#/components/responses/InvalidReq'
 *       '401': 
 *         $ref: '#/components/responses/Unauthenticated'
 *       '500': 
 *         $ref: '#/components/responses/NameDuplicate'
 */
router.post('/', isLoggedIn, postHeader)



/**
 * @swagger
 * /api/headers/{id}:
 *   put:
 *     summary: Updates a header
 *     tags: 
 *       - headers
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       $ref: '#/components/parameters/ID'
 *     requestBody:
 *       required: true
 *       description: Header name and cell values, which will overwrite current values 
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: 
 *                 $ref: '#/components/schemas/BasicMaxString'
 *               cells: 
 *                 $ref: '#/components/schemas/HeaderCells'
 *             required:
 *               - name
 *               - cells
 *     responses:         
 *       '200': 
 *         description: Success - returns the updated header
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Header'
 *       '400': 
 *         $ref: '#/components/responses/InvalidReq'
 *       '401': 
 *         $ref: '#/components/responses/Unauthenticated'
 *       '403': 
 *         $ref: '#/components/responses/Unauthorized'
 *       '404': 
 *         $ref: '#/components/responses/NotFound'
 *       '500': 
 *         description: Error - either the req param ID or header cell IDs are unable to cast to mongo ObjectIds, or the document name already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', isLoggedIn, isUserHeader, editHeader)



/**
 * @swagger
 * /api/headers/{id}:
 *   delete:
 *     summary: Deletes a header
 *     tags: 
 *       - headers
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       $ref: '#/components/parameters/ID'
 *     responses:         
 *       '200': 
 *         description: Success - returns the deleted header
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Header'
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
router.delete('/:id', isLoggedIn, isUserHeader, deleteHeader)



module.exports = router

