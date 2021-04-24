const connectDB = require('../loaders/db')
const setupApp = require('../loaders/app')
const request = require('supertest')
const User = require('../models/user')
const { v4: uuidv4 } = require('uuid')
const { generateToken, addTokenToUser, sendResetEmail, getTokenUser, passwordReset, sendConfEmail } = require('../services/PasswordReset')



let dbConnection
let app
let user


const postUser = async () => {
  user = await request(app)
    .post('/api/user/register')
    .send({ username: uuidv4(), email: `${uuidv4()}@test.com`, password: '11111Aab', confirmedPassword: '11111Aab', invitationCode: process.env.INVITATION_CODE })
  return user.body
}


beforeAll(async () => {
  dbConnection = await connectDB()  
  app = setupApp(dbConnection)
})


beforeEach(async () => {
  user = await postUser()
})


afterEach(async () => {
  await dbConnection.dropCollection('users')
})


afterAll(async () => {
  await dbConnection.dropDatabase()
  await dbConnection.close()
  console.log('Database connection closed')
})


describe('generating token', () => {
  test('generates token string', async () => {
    const token = await generateToken()
    expect(typeof token === 'string').toBe(true)
  })
})


describe('adding token to user', () => {
  test('saves token and token\'s expiration date to user', async () => {
    await addTokenToUser(user.email, 'testToken')
    const updatedUser = await User.findOne({ email: user.email })
    expect(updatedUser.resetPasswordToken).toBeDefined()
    expect(updatedUser.resetPasswordExpires).toBeDefined()
  })
  test('throws error if user not found', async () => {
    await expect(addTokenToUser('invalidEmail', 'testToken')).rejects.toThrow('No account with that email address exists')
  })
})


describe('sending reset email', () => {
  test('successfully sends reset email', async () => {
    await expect(sendResetEmail(user.email, 'testToken')).resolves.not.toThrow()
  })
})


describe('getting user with the generated token', () => {
  test('returns user', async () => {
    await addTokenToUser(user.email, 'token')
    await expect(getTokenUser('token')).resolves.not.toThrow()
  })
  test('rejects if invalid token provided', async () => {
    await addTokenToUser(user.email, 'token')
    await expect(getTokenUser('invalidToken')).rejects.toThrow('Password reset token is either invalid or has expired')
  })
})


describe('resetting password', () => {
  test('sets user resetPasswordToken and resetPasswordExpires properties to undefined', async () => {
    await addTokenToUser(user.email, 'validToken')
    const tokenUser = await getTokenUser('validToken')
    await expect(passwordReset(tokenUser, 'newPassword123')).resolves.not.toThrow()
    expect(tokenUser.resetPasswordToken).toBeUndefined()
    expect(tokenUser.resetPasswordExpires).toBeUndefined()
  })
})


describe('sending confirmation email', () => {
  test('successfully sends confirmation email', async () => {
    await expect(sendConfEmail(user.email)).resolves.not.toThrow()
  })
})





  
  

  
  