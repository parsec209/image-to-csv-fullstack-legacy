const connectDB = require('../loaders/db')
const setupApp = require('../loaders/app')
const request = require('supertest')
const { v4: uuidv4 } = require('uuid')
const User = require('../models/user')



let dbConnection
let app


const generateCreds = () => {
  const creds = { username: uuidv4(), email: `${uuidv4()}@test.com`, password: '11111Aab', confirmedPassword: '11111Aab', invitationCode: process.env.INVITATION_CODE }
  return creds
}


beforeAll(async () => {
  dbConnection = await connectDB()
  app = setupApp(dbConnection)
})


afterAll(async () => {
  await dbConnection.dropDatabase()
  await dbConnection.close()
  console.log('Database connection closed')
})


describe('POST /api/user/register', () => {
  test('responds with the newly registered user info', async () => {
    const user = await request(app)
      .post('/api/user/register')
      .send(generateCreds())
    expect(user.body).toHaveProperty('username')
    expect(user.body).toHaveProperty('email')
    expect(user.body).toHaveProperty('_id')
    expect(user.statusCode).toBe(200)
  })
  test('handles request body validation errors (i.e. password does not meet pattern requirements)', async () => {
    const creds = generateCreds()
    creds.password = 'aaaa123456'
    creds.confirmedPassword = 'aaaa123456'
    const user = await request(app)
      .post('/api/user/register')
      .send(creds)
    expect(user.body).toStrictEqual({ 'message': 'Request body error: "password" with value "aaaa123456" fails to match the required pattern: /^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/', 'status': 'fail' })
    expect(user.statusCode).toBe(400)
  }) 
  test('handles invalid invitation code error', async () => {
    const creds = generateCreds()
    creds.invitationCode = 'incorrect'
    const user = await request(app)
      .post('/api/user/register')
      .send(creds)
    expect(user.body).toStrictEqual({ 'message': 'Must supply valid invitation code to register', 'status': 'fail' })
    expect(user.statusCode).toBe(401)
  }) 
  test('handles database validation errors (i.e. username already exists)', async () => {
    const creds = generateCreds()
    await request(app)
      .post('/api/user/register')
      .send(creds)
    const error = await request(app)
      .post('/api/user/register')
      .send(creds)
    expect(error.body).toStrictEqual({ 'message': 'A user with the given username is already registered', 'status': 'fail' })
    expect(error.statusCode).toBe(500)
  })
  test('handles 11000 error code (i.e. email already exists)', async () => {
    const creds = generateCreds()
    await request(app)
      .post('/api/user/register')
      .send(creds)
    const error = await request(app)
      .post('/api/user/register')
      .send({ username: 'newUser123434980', email: creds.email, password: creds.password, confirmedPassword: creds.confirmedPassword, invitationCode: creds.invitationCode })
    expect(error.body).toStrictEqual({ 'message': `The same value already exists for the following field: { email: "${creds.email}" }`, 'status': 'fail' })
    expect(error.statusCode).toBe(500)
  })
})


describe('POST /api/user/login', () => {
  const { username, email, password, confirmedPassword, invitationCode } = generateCreds()

  beforeAll(async () => {
    await request(app)
      .post('/api/user/register')
      .send({ username, email, password, confirmedPassword, invitationCode })
  })

  test('authenticates user and responds with user info and session cookie', async () => {
    const user = await request.agent(app)
      .post('/api/user/login')
      .send({ username, password })
    expect(user.body).toHaveProperty('_id')
    expect(user.body).toHaveProperty('username')
    expect(user.body).toHaveProperty('email')
    expect(user.header['set-cookie'][0]).toMatch(/mySession/)
    expect(user.statusCode).toBe(200)
  })
  test('handles authentication errors', async () => {
    const login = await request.agent(app)
      .post('/api/user/login')
      .send({ username, password: 'wrongPassword' })
    expect(login.body).toStrictEqual({ 'message': 'Authentication failed', 'status': 'fail' })
    expect(login.statusCode).toBe(401)
  })
  test('regenerates session after logging in when already authenticated', async () => {
    const agent = request.agent(app)
    const user = await agent
      .post('/api/user/login')
      .send({ username, password })
    const user2 = await agent
      .post('/api/user/login')
      .send({ username, password })
    //shows new cookie is sent with second login  
    expect(user.header['set-cookie'][0]).toMatch(/mySession/)
    expect(user2.header['set-cookie'][0]).toMatch(/mySession/)
    expect(user2.statusCode).toBe(200)
  })
})


describe('GET /api/user', () => {
  test('responds with user info', async () => {
    const { username, email, password, confirmedPassword, invitationCode } = generateCreds()
    const agent = request.agent(app)
    await request(app)
      .post('/api/user/register')
      .send({ username, email, password, confirmedPassword, invitationCode })
    await agent
      .post('/api/user/login')
      .send({ username, password })
    const user = await agent
      .get('/api/user')
    expect(user.body).toHaveProperty('_id')
    expect(user.body).toHaveProperty('username')
    expect(user.body).toHaveProperty('email')
    expect(user.statusCode).toBe(200)
  })
  test('handles authentication error', async () => {
    const error = await request.agent(app)
      .get('/api/user')
    expect(error.body).toStrictEqual({ 'message': 'Not authenticated, please login', 'status': 'fail' })
    expect(error.statusCode).toBe(401)
  })
})


describe('GET /api/user/logout', () => {
  test('logs user out and destroys current session', async () => {
    const { username, email, password, confirmedPassword, invitationCode } = generateCreds()
    const agent = request.agent(app)
    await request(app)
      .post('/api/user/register')
      .send({ username, email, password, confirmedPassword, invitationCode })
    const loggedInUser = await agent
      .post('/api/user/login')
      .send({ username, password })
    const loggedOutUser = await agent
      .get('/api/user/logout')
    expect(loggedInUser.header['set-cookie'][0]).toContain(loggedOutUser.body)
    expect(loggedOutUser.statusCode).toBe(200)
    //check if session was destroyed
    const response = await agent
      .get('/api/user')
    expect(response.body).toStrictEqual({ 'message': 'Not authenticated, please login', 'status': 'fail' })
    expect(response.statusCode).toBe(401)
  })
  test('handles authentication error', async () => {
    const error = await request.agent(app)
      .get('/api/user/logout')
    expect(error.body).toStrictEqual({ 'message': 'Not authenticated, please login', 'status': 'fail' })
    expect(error.statusCode).toBe(401)
  })
})


describe('POST /api/user/forgot', () => {
  const { username, email, password, confirmedPassword, invitationCode } = generateCreds()

  beforeAll(async () => {
    await request(app)
      .post('/api/user/register')
      .send({ username, email, password, confirmedPassword, invitationCode })
  })

  test('responds with success status code after email sent', async () => {
    const response = await request(app)
      .post('/api/user/forgot')
      .send({ email })
    expect(response.statusCode).toBe(200)
  })
  test('handles invalid email error', async () => {
    const response = await request(app)
      .post('/api/user/forgot')
      .send({ email: 'invalid@test.com' })
    expect(response.body).toStrictEqual({ 'message': 'No account with that email address exists', 'status': 'fail' })
    expect(response.statusCode).toBe(404)
  })
})


describe('POST /api/user/reset/:token', () => {
  const { username, email, password, confirmedPassword, invitationCode } = generateCreds()

  beforeAll(async () => {
    await request(app)
      .post('/api/user/register')
      .send({ username, email, password, confirmedPassword, invitationCode })
    await request(app)
      .post('/api/user/forgot')
      .send({ email })
  })

  test('responds with success status code after resetting password', async () => {
    const user = await User.findOne({ email })
    const token = user.resetPasswordToken
    const response = await request(app)
      .post(`/api/user/reset/${token}`)
      .send({ password: 'newPassword123', confirmedPassword: 'newPassword123' })
    expect(response.statusCode).toBe(200)
  })
  test('handles request parameter validation error', async () => {
    const response = await request(app)
      .post('/api/user/reset/Abc123')
      .send({ password: 'newPassword123', confirmedPassword: 'newPassword123' })
      expect(response.body).toStrictEqual({ 'message': 'Request paramater error: "value" with value "Abc123" fails to match the required pattern: /^[a-z0-9]+$/', 'status': 'fail' })
    expect(response.statusCode).toBe(400)
  })
  test('handles request body validation errors', async () => {
    const response = await request(app)
      .post('/api/user/reset/abc123')
      .send({ password: 'newPassword123' })
      expect(response.body).toStrictEqual({ 'message': 'Request body error: "confirmedPassword" is required', 'status': 'fail' })
    expect(response.statusCode).toBe(400)
  })
  test('handles invalid or expired token', async () => {
    const response = await request(app)
      .post('/api/user/reset/abc123')
      .send({ password: 'newPassword123', confirmedPassword: 'newPassword123' })
      expect(response.body).toStrictEqual({ 'message': 'Password reset token is either invalid or has expired', 'status': 'fail' })
    expect(response.statusCode).toBe(404)
  })
})

  
describe('POST /api/user/change', () => {

  const register = async () => {
    const creds = generateCreds()
    const agent = request.agent(app)
    await request(app)
      .post('/api/user/register')
      .send(creds)
    return { creds, agent }  
  }

  test('responds with success status code after changing password', async () => { 
    const { creds, agent } = await register()
    const { username, password } = creds
    await agent
      .post('/api/user/login')
      .send({ username, password })
    const response = await agent
      .post('/api/user/change')
      .send({ oldPassword: password, password: '22222Aab', confirmedPassword: '22222Aab' })
    expect(response.statusCode).toBe(200)
  })
  test('handles request body validation errors (i.e. old password is same as new password)', async () => {
    const { creds, agent } = await register()
    const { username, password } = creds
    await agent
      .post('/api/user/login')
      .send({ username, password })
    const response = await agent
      .post('/api/user/change')
      .send({ oldPassword: '22222Aab', password: '22222Aab', confirmedPassword: '22222Aab' })
    expect(response.body).toStrictEqual({ 'message': 'Request body error: "password" contains an invalid value', 'status': 'fail' })
    expect(response.statusCode).toBe(400)
  })
  test('handles authentication error', async () => {
    const { agent } = await register()
    const error = await agent
      .post('/api/user/change')
    expect(error.body).toStrictEqual({ 'message': 'Not authenticated, please login', 'status': 'fail' })
    expect(error.statusCode).toBe(401)
  })
  test('handles database validation errors (i.e. password incorrect)', async () => {
    const { creds, agent } = await register()
    const { username, password } = creds
    await agent
      .post('/api/user/login')
      .send({ username, password })
    const response = await agent
      .post('/api/user/change')
      .send({ oldPassword: 'invalid', password: '22222Aab', confirmedPassword: '22222Aab' })
    expect(response.body).toStrictEqual({ 'message': 'Password is incorrect', 'status': 'fail' })
    expect(response.statusCode).toBe(500)
  })
})


