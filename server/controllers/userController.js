const User = require('../models/user')
const { generateToken, addTokenToUser, sendResetEmail, getTokenUser, passwordReset, sendConfEmail } = require('../services/PasswordReset')
const InputError = require('../util/inputError')
const Joi = require('joi')
const { validateReqBody, validateReqParams, schemas } = require('../util/argsValidator')




module.exports = {


  register: async (req, res, next) => {
    try {
      const { username, email, password, invitationCode } = validateReqBody(req.body, 
        {
          username: Joi.string().trim().required(),
          email: Joi.string().trim().email().required(),
          password: schemas.password.required(),
          confirmedPassword: Joi.any().valid(Joi.ref('password')).required(),
          invitationCode: Joi.string().required()
        }
      )
      if (invitationCode !== process.env.INVITATION_CODE) {
        throw new InputError('Must supply valid invitation code to register', 401)
      }
      const newUser = new User({ username, email })
      await User.register(newUser, password)
      return res.json({ _id: newUser._id, username, email })
    } catch (err) { 
      return next(err)
    }
  },
  

  logout: (req, res, next) => {
    const { sessionID, session } = req
    session.destroy(err => {
      if (err) { 
        return next(err)
      }
      return res.json(sessionID)
    })
  },


  getUser: (req, res, next) => {
    const { _id, username, email } = req.user
    return res.json({ _id, username, email })
  },


  sendPasswordResetLink: async (req, res, next) => {
    try {
      const { email } = validateReqBody(req.body, { email: Joi.string().trim().email().required() })
      const token = await generateToken()
      await addTokenToUser(email, token)
      await sendResetEmail(email, token)
      return res.end()
    } catch (err) { 
      return next(err)
    }
  },

  
  resetPassword: async (req, res, next) => {
    try {
      const token = validateReqParams(req.params.token)
      const { password } = validateReqBody(req.body, 
        {
          password: schemas.password.required(),
          confirmedPassword: Joi.any().valid(Joi.ref('password')).required()
        }
      )
      const tokenUser = await getTokenUser(token)
      await passwordReset(tokenUser, password)
      await sendConfEmail(tokenUser.email)
      return res.end()
    } catch (err) { 
      return next(err)
    }
  },


  changePassword: async (req, res, next) => {
    try {
      const user = req.user
      const { oldPassword, password } = validateReqBody(req.body, 
        {
          oldPassword: Joi.string().required(),
          password: schemas.password.disallow(Joi.ref('oldPassword')).required(),
          confirmedPassword: Joi.any().valid(Joi.ref('password')).required()
        }
      )
      await user.changePassword(oldPassword, password)
      await sendConfEmail(user.email)
      return res.end()
    } catch (err) { 
      return next(err)
    }
  }
}





