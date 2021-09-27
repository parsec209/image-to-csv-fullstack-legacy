const express = require('express')
const router = express.Router()
const { register, logout, getUser, sendPasswordResetLink, resetPassword, changePassword } = require('../../controllers/userController')
const { authenticate, isLoggedIn } = require('../../middleware/auth')



/**
 * @swagger
 * /api/user/register:
 *   post:
 *     summary: Registers new user
 *     tags: 
 *       - users
 *     requestBody:
 *       required: true
 *       description: User credentials
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: 
 *                 $ref: '#/components/schemas/BasicMaxString'
 *               email: 
 *                 $ref: '#/components/schemas/Email'
 *               password: 
 *                 $ref: '#/components/schemas/Password'
 *               confirmedPassword: 
 *                 $ref: '#/components/schemas/Password'
 *               invitationCode:
 *                 $ref: '#/components/schemas/BasicString'
 *             required:
 *               - username
 *               - email
 *               - password
 *               - confirmedPassword
 *               - invitationCode
 *     responses:         
 *       '200': 
 *         description: Success - creates user and responds with user info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInfo'
 *       '400': 
 *         $ref: '#/components/responses/InvalidReq'
 *       '401': 
 *         description: Error - invalid invitation code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       '500': 
 *         description: Error - an input did not pass database validation (i.e. username already exists, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', register)



/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: Authenticates user
 *     tags: 
 *       - users
 *     requestBody:
 *       required: true
 *       description: User credentials
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: 
 *                 $ref: '#/components/schemas/BasicMaxString'              
 *               password: 
 *                 $ref: '#/components/schemas/Password'
 *             required:
 *               - username
 *               - password
 *     responses:         
 *       '200': 
 *         description: Success - authenticates user and returns user info. The session ID is also returned in a cookie named `mySession`. You need to include this cookie in subsequent requests
 *         headers: 
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: mySession=abcde12345; Path=/; Expires=Sun, 12 Sep 2021 23:47:23 GMT; HttpOnly
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInfo'
 *       '401': 
 *         description: Error - invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', authenticate, getUser)



/**
 * @swagger
 * /api/user/:
 *   get:
 *     summary: Gets user info
 *     tags: 
 *       - users
 *     security:
 *       - cookieAuth: []
 *     responses:         
 *       '200': 
 *         description: Success - returns user info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserInfo'
 *       '401': 
 *         $ref: '#/components/responses/Unauthenticated'
 */
router.get('/', isLoggedIn, getUser)



/**
 * @swagger
 * /api/user/logout:
 *   get:
 *     summary: Logs out, destroying the current session
 *     tags: 
 *       - users
 *     security:
 *       - cookieAuth: []
 *     responses:         
 *       '200': 
 *         description: Success - returns destroyed session ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BasicString'
 *       '401': 
 *         $ref: '#/components/responses/Unauthenticated'
 */
router.get('/logout', isLoggedIn, logout)



/**
 * @swagger
 * /api/user/forgot:
 *   post:
 *     summary: Sends password reset email to user
 *     tags: 
 *       - users
 *     requestBody:
 *       required: true
 *       description: Contains email
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: 
 *                 $ref: '#/components/schemas/Email' 
 *             required:
 *               - email
 *     responses:         
 *       '200': 
 *         description: Success - password reset email sent
 *       '400': 
 *         $ref: '#/components/responses/InvalidReq'
 *       '404': 
 *         description: Error - email does not match an account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/forgot', sendPasswordResetLink)



/**
 * @swagger
 * /api/user/reset/{token}:
 *   post:
 *     summary: Resets password
 *     tags: 
 *       - users
 *     parameters:
 *       - in: path
 *         name: token 
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-z0-9]+$'
 *         description: Token used for password reset
 *     requestBody:
 *       required: true
 *       description: Contains password and password confirmation
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password: 
 *                 $ref: '#/components/schemas/Password' 
 *               confirmedPassword: 
 *                 $ref: '#/components/schemas/Password' 
 *             required:
 *               - password
 *               - confirmedPassword
 *     responses:         
 *       '200': 
 *         description: Success - password has been reset
 *       '400': 
 *         $ref: '#/components/responses/InvalidReq'
 *       '404': 
 *         description: Error - token not found (expired or invalid)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/reset/:token', resetPassword)



/**
 * @swagger
 * /api/user/change:
 *   post:
 *     summary: Changes password
 *     tags: 
 *       - users
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       description: Old and new password, and password confirmation
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword: 
 *                 $ref: '#/components/schemas/Password' 
 *               password: 
 *                 $ref: '#/components/schemas/Password' 
 *               confirmedPassword: 
 *                 $ref: '#/components/schemas/Password' 
 *             required: 
 *               - oldPassword
 *               - password
 *               - confirmedPassword
 *     responses:         
 *       '200': 
 *         description: Success - password changed and email confirmation sent
 *       '400': 
 *         $ref: '#/components/responses/InvalidReq'
 *       '401': 
 *         $ref: '#/components/responses/Unauthenticated'
 *       '500': 
 *         description: Error - invalid password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/change', isLoggedIn, changePassword)



/**
 * @swagger
 * components:
 *   schemas:
 *     BasicString:
 *       type: string
 *       minLength: 1
 *     BasicMaxString:
 *       type: string
 *       minLength: 1
 *       maxLength: 100
 *     Email:
 *       type: string 
 *       format: email
 *       minLength: 1
 *     UserInfo:
 *       type: object
 *       properties:
 *         username: 
 *           $ref: '#/components/schemas/BasicMaxString'
 *         email:  
 *           $ref: '#/components/schemas/Email'
 *         _id:
 *           $ref: '#/components/schemas/BasicString'
 *       required:
 *         - username
 *         - email
 *         - _id
 *     Password:
 *       type: string 
 *       format: password
 *       pattern: '^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$'   
 *     FileBatchID: 
 *       type: string
 *       format: uuid
 *       minLength: 1
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           $ref: '#/components/schemas/BasicString'
 *       required:
 *         - id    
 *     HeaderCells:
 *       type: array
 *       items:
 *         type: object
 *         properties:
 *           _id:
 *             $ref: '#/components/schemas/BasicString'
 *           value:
 *             $ref: '#/components/schemas/BasicMaxString'
 *         required:
 *           - value
 *       minItems: 1
 *       maxItems: 52
 *     Header: 
 *       type: object
 *       properties:
 *         _id:
 *           $ref: '#/components/schemas/BasicString'
 *         name:
 *           $ref: '#/components/schemas/BasicMaxString'
 *         cells:
 *           $ref: '#/components/schemas/HeaderCells'
 *         user:
 *           $ref: '#/components/schemas/User'
 *         __v:
 *           type: number
 *       required: 
 *         - _id
 *         - name
 *         - cells
 *         - user
 *         - __v
 *     PhraseCount:
 *       type: integer
 *       minimum: 1
 *       maximum: 100
 *     StringType:
 *       type: string
 *       enum: [phrase, word] 
 *     DateFormat:
 *       type: string
 *       pattern: '^[-MDY\/\s\,]+$'
 *     DaysAdded:
 *       type: integer
 *       minimum: 0
 *       maximum: 100
 *     CellSectIsNotEmptyOrToday:
 *       type: object
 *       properties:
 *         _id:
 *           $ref: '#/components/schemas/BasicString'
 *         searchOrInputMethod:
 *           type: string
 *           enum: [topPhrase, leftPhrase, pattern, customValue]
 *         phraseCount:
 *           $ref: '#/components/schemas/PhraseCount'
 *         stringType:
 *           $ref: '#/components/schemas/StringType'
 *         phraseOrValue:
 *           $ref: '#/components/schemas/BasicMaxString'
 *         appendChars:
 *           $ref: '#/components/schemas/BasicMaxString'
 *         dateFormat:
 *           $ref: '#/components/schemas/DateFormat'
 *         daysAdded:
 *           $ref: '#/components/schemas/DaysAdded'
 *         notes:
 *           $ref: '#/components/schemas/BasicMaxString'
 *       required:
 *         - searchOrInputMethod
 *         - phraseOrValue
 *     CellSectIsEmpty:
 *       type: object
 *       properties:
 *         _id:
 *           $ref: '#/components/schemas/BasicString'
 *         phraseCount:
 *           $ref: '#/components/schemas/PhraseCount'
 *         stringType:
 *           $ref: '#/components/schemas/StringType' 
 *         daysAdded:
 *           $ref: '#/components/schemas/DaysAdded'
 *         notes:
 *           $ref: '#/components/schemas/BasicMaxString'
 *     CellSectIsToday:
 *       type: object
 *       properties:
 *         _id:
 *           $ref: '#/components/schemas/BasicString' 
 *         searchOrInputMethod:
 *           type: string
 *           enum: [today]
 *         phraseCount:
 *           $ref: '#/components/schemas/PhraseCount'
 *         stringType:
 *           $ref: '#/components/schemas/StringType'
 *         appendChars:
 *           $ref: '#/components/schemas/BasicMaxString'
 *         dateFormat:
 *           $ref: '#/components/schemas/DateFormat'
 *         daysAdded:
 *           $ref: '#/components/schemas/DaysAdded'
 *         notes:
 *           $ref: '#/components/schemas/BasicMaxString'
 *       required:
 *         - searchOrInputMethod
 *     DataRows:
 *       type: array
 *       items:
 *         type: object
 *         properties:
 *           _id:
 *             $ref: '#/components/schemas/BasicString'
 *           dataCells:
 *             type: array 
 *             items: 
 *               type: object
 *               properties:
 *                 _id:
 *                   $ref: '#/components/schemas/BasicString'
 *                 cellSects:
 *                   type: array
 *                   items:
 *                     oneOf:
 *                       - $ref: '#/components/schemas/CellSectIsNotEmptyOrToday'
 *                       - $ref: '#/components/schemas/CellSectIsEmpty'
 *                       - $ref: '#/components/schemas/CellSectIsToday'
 *                   minItems: 1 
 *                   maxItems: 4 
 *               required:
 *                 - cellSects
 *             minItems: 1
 *             maxItems: 52
 *         required:
 *           - dataCells
 *       minItems: 1
 *       maxItems: 100
 *     RecurringDoc: 
 *       type: object
 *       properties:
 *         _id:
 *           $ref: '#/components/schemas/BasicString'
 *         name:
 *           $ref: '#/components/schemas/BasicMaxString'
 *         idPhrase:
 *           $ref: '#/components/schemas/BasicMaxString'
 *         idPhrase2:
 *           $ref: '#/components/schemas/BasicMaxString'
 *         header:
 *           $ref: '#/components/schemas/HeaderCells'
 *         dataRows:
 *           $ref: '#/components/schemas/DataRows'
 *         user:
 *           $ref: '#/components/schemas/User'
 *         __v:
 *           type: number
 *       required: 
 *         - _id
 *         - name
 *         - idPhrase
 *         - header
 *         - dataRows
 *         - user
 *         - __v
 *     Error:
 *       type: object 
 *       properties:
 *         status: 
 *           type: string 
 *           enum: [fail]
 *         message: 
 *           $ref: '#/components/schemas/BasicString'
 *       required:
 *         - status
 *         - message
 *   parameters:
 *     ID:
 *       in: path
 *       name: id
 *       description: Database document ID
 *       required: true
 *       schema:
 *         type: string
 *         pattern: '^[a-z0-9]+$'
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: mySession 
 *   responses:
 *     InvalidReq:
 *       description: Error - an input did not pass the request body or parameter validation
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     Unauthenticated:
 *       description: Error - not authenticated
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     Unauthorized: 
 *       description: Error - db document belongs to another user
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     NotFound: 
 *       description: Error - db document cannot be found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     CastFailed: 
 *       description: Error - cast to mongo ObjectId failed for parameter variable
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     NameDuplicate: 
 *       description: Error - name already taken for db document
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 *     IDPhraseDuplicate: 
 *       description: Error - ID phrase already taken for recurring doc
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Error'
 */



/**
 * @swagger
 * tags:
 *   - name: users
 *     description: User routes
 *   - name: transfers
 *     description: Transfer routes
 *   - name: headers
 *     description: Header routes
 *   - name: docs
 *     description: Recurring doc routes
 */



module.exports = router


