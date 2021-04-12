const express = require('express')
const router  = express.Router()
const { isLoggedIn, isUserDoc } = require('../../middleware/auth')
const { name, idPhrase, header, dataRows, ExpressValidation } = require('../../middleware/ExpressValidator')
const { getDocs, postDoc, getDoc, editDoc, deleteDoc } = require('../../controllers/docsController')


router.get('/', isLoggedIn, getDocs)  
router.post('/', [name, idPhrase, header, dataRows], ExpressValidation, isLoggedIn, postDoc)
router.get('/:id', isLoggedIn, isUserDoc, getDoc)
router.put('/:id', [name, idPhrase, header, dataRows], ExpressValidation, isLoggedIn, isUserDoc, editDoc)
router.delete('/:id', isLoggedIn, isUserDoc, deleteDoc)


module.exports = router

