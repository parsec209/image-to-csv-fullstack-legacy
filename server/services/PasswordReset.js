/**
 * PasswordReset module
 * @module PasswordReset
 */

const User = require('../models/user')
const util = require('util')
const crypto = require('crypto')
const InputError = require('../util/InputError')
const { validateArgs } = require('../util/ArgsValidator')
const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


// @ts-check


/**
 * Generates token for password reset 
 * @returns {Promise<string>} - Token
 */
const generateToken = async function() {
  const getBuf = util.promisify(crypto.randomBytes)
  const buf = await getBuf(20)
  const token = buf.toString('hex')
  return token
}


/**
 * Adds token and reset expiration date to user
 * @param {string} email - User's email
 * @param {string} token - Token
 * @returns {Promise<void>}
 */
const addTokenToUser = async function(email, token) {
  validateArgs(['String', 'String'], arguments)
  const user = await User.findOne({ email })
  if (!user) {
    throw new InputError('No account with that email address exists', 404)
  }
  user.resetPasswordToken = token
  user.resetPasswordExpires = Date.now() + 3600000  // 1 hour
  await user.save()
}


/**
 * Sends email to user with password reset link
 * @param {string} recipient - User's email
 * @param {string} token - Token
 * @returns {Promise<void>}
 */
const sendResetEmail = async function(recipient, token) {
  validateArgs(['String', 'String'], arguments)
  const body = 'You are receiving this email because you have requested a password reset for your Image-To-CSV account.\n\n' +
    'Please either click on the following link, or paste the link into your browser, to complete the password reset process:\n\n' +
    `${process.env.BASE_URL}reset/${token}\n\n` +
    'This link will expire in one hour.\n\n' +
    'If you did not request this password reset, please ignore this email and your password will remain unchanged.\n'
  const msg = {
    to: recipient,
    from: process.env.RESETEMAIL,
    subject: 'Image-To-CSV Password Reset',
    text: body
  }
  await sgMail.send(msg)
}


/**
 * Retrieves user using token query
 * @param {string} token - Token
 * @returns {Promise<User>} - User
 */
const getTokenUser = async function(token) {
  validateArgs(['String'], arguments)
  const tokenUser = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() }})
  if (!tokenUser) {
    throw new InputError('Password reset token is either invalid or has expired', 400)
  }
  return tokenUser
}


/**
 * Resets password
 * @param {User} tokenUser - User with the token
 * @param {string} password - User's password
 * @returns {Promise<void>}
 */
const passwordReset = async function(tokenUser, password) {
  validateArgs(['{email: String, ...}', 'String'], arguments)
  await tokenUser.setPassword(password)
  tokenUser.resetPasswordToken = undefined
  tokenUser.resetPasswordExpires = undefined
  await tokenUser.save()
}


/**
 * Sends email to user confirming password reset
 * @param {string} email - User's email
 * @returns {Promise<void>} 
 */
const sendConfEmail = async function(email) {
  validateArgs(['String'], arguments)
  const body = 'Hello,\n\n' +
    'This is a confirmation that your Image-To-CSV password for account ' + email + ' has just been changed.\n'
  const msg = {
    to: email,
    from: process.env.RESETEMAIL,
    subject: 'Image-To-CSV Password Change',
    text: body,
    //html: body
  }
  await sgMail.send(msg)
}


module.exports = { generateToken, addTokenToUser, sendResetEmail, getTokenUser, passwordReset, sendConfEmail }
