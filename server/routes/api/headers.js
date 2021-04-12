const express = require('express')
const router  = express.Router()
const { isLoggedIn, isUserHeader } = require('../../middleware/auth')
const { cells, name, ExpressValidation } = require('../../middleware/ExpressValidator')
const { getHeaders, postHeader, getHeader, editHeader, deleteHeader } = require('../../controllers/headersController')


router.get('/', isLoggedIn, getHeaders)  
router.post('/', [cells, name], ExpressValidation, isLoggedIn, postHeader)
router.get('/:id', isLoggedIn, isUserHeader, getHeader)
router.put('/:id', [cells, name], ExpressValidation, isLoggedIn, isUserHeader, editHeader)
router.delete('/:id', isLoggedIn, isUserHeader, deleteHeader)


module.exports = router

