const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
const { passwordValidator } = require('../util/postValidator')


const userSchema = new mongoose.Schema({
  username: String,
  email: {
    type: String,
    required: true,
    unique: true 
  }, 
  password: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date
})


const options = {
  usernameLowerCase: true,
  passwordValidator,
  errorMessages: {
    IncorrectPasswordError: 'Password is incorrect',
    IncorrectUsernameError: 'Username is incorrect'
  }
}

userSchema.plugin(passportLocalMongoose, options)

module.exports = mongoose.model('User', userSchema)



