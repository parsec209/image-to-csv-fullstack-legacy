const express = require('express')
const router = express.Router()
const { isLoggedIn } = require('../../middleware/auth')
const localUpload = require('../../middleware/localUpload')
const { fileBatchID, pageSelections, dateToday, ExpressValidation } = require('../../middleware/ExpressValidator')
const { cloudUpload, getData, getZip } = require('../../controllers/transfersController')


router.post('/upload', isLoggedIn, localUpload, cloudUpload)  
router.post('/extract', [fileBatchID, pageSelections, dateToday], ExpressValidation, isLoggedIn, getData)  
router.post('/write', [fileBatchID], ExpressValidation, isLoggedIn, getZip)  


module.exports = router


