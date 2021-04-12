const express = require('express')
const router = express.Router()
const { register, logout, getUser, sendPasswordResetLink, resetPassword, changePassword } = require('../../controllers/userController')
const { authenticate, isLoggedIn } = require('../../middleware/auth')
const { username, email, password, confirmedPassword, oldPassword, ExpressValidation } = require('../../middleware/ExpressValidator')


router.get('/', isLoggedIn, getUser)
router.post('/register', [username, email, password, confirmedPassword], ExpressValidation, register)
router.post('/login', [username, password], ExpressValidation, authenticate, getUser)
router.get('/logout', isLoggedIn, logout)
router.post('/forgot', [email], ExpressValidation, sendPasswordResetLink)
router.post('/reset/:token', [password, confirmedPassword], ExpressValidation, resetPassword)
router.post('/change', [oldPassword, password, confirmedPassword], ExpressValidation, isLoggedIn, changePassword)


module.exports = router


