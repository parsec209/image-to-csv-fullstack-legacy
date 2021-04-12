const User = require('../models/user')
const { generateToken, addTokenToUser, sendResetEmail, getTokenUser, passwordReset, sendConfEmail } = require('../services/PasswordReset')
const InputError = require('../util/InputError')


module.exports = {


  register: async (req, res, next) => {
    let { username, email, password, invitationCode } = req.body  
    try {
      const newUser = new User({ username, email })
      if (invitationCode === process.env.INVITATION_CODE) {
        await User.register(newUser, password)
        return res.json(newUser)
      } else {
        throw new InputError('Must supply valid invitation code to register', 401)
      } 
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
    return res.json(req.user)
  },


  sendPasswordResetLink: async (req, res, next) => {
    const email = req.body.email
    try {
      const token = await generateToken()
      await addTokenToUser(email, token)
      await sendResetEmail(email, token)
      return res.end()
    } catch (err) { 
      return next(err)
    }
  },

  
  resetPassword: async (req, res, next) => {
    const { password } = req.body
    const token = req.params.token
    try {
      const tokenUser = await getTokenUser(token)
      await passwordReset(tokenUser, password)
      await sendConfEmail(tokenUser.email)
      return res.end()
    } catch (err) { 
      return next(err)
    }
  },

  
  changePassword: async (req, res, next) => {
    const { oldPassword, password } = req.body
    const user = req.user
    try {
      await user.changePassword(oldPassword, password)
      await sendConfEmail(user.email)
      return res.end()
    } catch (err) { 
      return next(err)
    }
  }
}





