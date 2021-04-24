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
    expect(user.body).toHaveProperty('_id')
    expect(user.body).toHaveProperty('username')
    expect(user.body).toHaveProperty('email')
    expect(user.statusCode).toBe(200)
  })

  describe('validating password', () => {
    test('rejects with no capital letters', async () => {
      const creds = generateCreds()
      creds.password = 'aaaa123456'
      creds.confirmedPassword = 'aaaa123456'
      const user = await request(app)
        .post('/api/user/register')
        .send(creds)
      expect(user.body).toStrictEqual({ 'message': 'Password must be at least eight characters long and contain an upper case letter, a lower case letter, and a number, with no special characters', 'status': 'fail' })
      expect(user.statusCode).toBe(400)
    }) 
    test('rejects with no lower case letters', async () => {
      const creds = generateCreds()
      creds.password = 'AAAA123456'
      creds.confirmedPassword = 'AAAA123456'
      const user = await request(app)
        .post('/api/user/register')
        .send(creds)
      expect(user.body).toStrictEqual({ 'message': 'Password must be at least eight characters long and contain an upper case letter, a lower case letter, and a number, with no special characters', 'status': 'fail' })
      expect(user.statusCode).toBe(400)
    }) 
    test('rejects with no numbers', async () => {
      const creds = generateCreds()
      creds.password = 'AAAAbbbb'
      creds.confirmedPassword = 'AAAAbbbb'
      const user = await request(app)
        .post('/api/user/register')
        .send(creds)
      expect(user.body).toStrictEqual({ 'message': 'Password must be at least eight characters long and contain an upper case letter, a lower case letter, and a number, with no special characters', 'status': 'fail' })
      expect(user.statusCode).toBe(400)
    }) 
    test('rejects with special chars', async () => {
      const creds = generateCreds()
      creds.password = '11111@Aab'
      creds.confirmedPassword = '11111@Aab'
      const user = await request(app)
        .post('/api/user/register')
        .send(creds)
      expect(user.body).toStrictEqual({ 'message': 'Password must be at least eight characters long and contain an upper case letter, a lower case letter, and a number, with no special characters', 'status': 'fail' })
      expect(user.statusCode).toBe(400)
    }) 
  })

  describe('handling Express validation errors', () => {
    test('rejects if inputs are either missing or invalid ', async () => {
      const creds = { email: 'invalidEmail' }
      const user = await request(app)
        .post('/api/user/register')
        .send(creds)
      expect(user.body).toStrictEqual({ 'message': 'Missing string in request body: username. Must include a valid email address in request body. Missing string in request body: password. Missing string in request body: confirmedPassword', 'status': 'fail' })
      expect(user.statusCode).toBe(400)
    })
    test('rejects if password and confirmation password do not match', async () => {
      const creds = generateCreds()
      creds.confirmedPassword = '22222Aab'
      const user = await request(app)
        .post('/api/user/register')
        .send(creds)
      expect(user.body).toStrictEqual({ 'message': 'Password and confirmed password must match', 'status': 'fail' })
      expect(user.statusCode).toBe(400)
    }) 
  })
})


describe('POST /api/user/login', () => {
  const { username, email, password, confirmedPassword, invitationCode } = generateCreds()

  beforeAll(async () => {
    await request(app)
      .post('/api/user/register')
      .send({ username, email, password, confirmedPassword, invitationCode })
  })

  test('handles authentication errors', async () => {
    const login = await request.agent(app)
      .post('/api/user/login')
      .send({ username, password: 'wrongPassword' })
    expect(login.body).toStrictEqual({ 'message': 'Authentication failed', 'status': 'fail' })
    expect(login.statusCode).toBe(401)
  })
  test('authenticates user and responds with user info', async () => {
    const user = await request.agent(app)
      .post('/api/user/login')
      .send({ username, password })
    expect(user.body).toHaveProperty('_id')
    expect(user.body).toHaveProperty('username')
    expect(user.body).toHaveProperty('email')
    expect(user.statusCode).toBe(200)
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
    expect(user.header['set-cookie']).toBeDefined()
    expect(user2.header['set-cookie']).toBeDefined()
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
  test('handles service errors', async () => {
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
  test('handles service errors', async () => {
    const response = await request(app)
      .post('/api/user/reset/invalidToken')
      .send({ password: 'newPassword123', confirmedPassword: 'newPassword123' })
      expect(response.body).toStrictEqual({ 'message': 'Password reset token is either invalid or has expired', 'status': 'fail' })
    expect(response.statusCode).toBe(400)
  })
})

  
describe('POST /api/user/change', () => {
  const { username, email, password, confirmedPassword, invitationCode } = generateCreds()
  let agent
  
  beforeAll(async () => {
    agent = request.agent(app)
    await request(app)
      .post('/api/user/register')
      .send({ username, email, password, confirmedPassword, invitationCode })
    await agent
      .post('/api/user/login')
      .send({ username, password })
  })

  describe('handling Express validation errors', () => {
    test('rejects if missing oldPassword', async () => {
      const response = await agent
        .post('/api/user/change')
        .send({ password: '22222Aab', confirmedPassword: '22222Aab' })
      expect(response.body).toStrictEqual({ 'message': 'Missing string in request body: oldPassword', 'status': 'fail' })
      expect(response.statusCode).toBe(400)
    })
    test('rejects if oldPassword is same as password', async () => {
      const response = await agent
        .post('/api/user/change')
        .send({ oldPassword: '22222Aab', password: '22222Aab', confirmedPassword: '22222Aab' })
      expect(response.body).toStrictEqual({ 'message': 'New password must be different from current password', 'status': 'fail' })
      expect(response.statusCode).toBe(400)
    })
  })

  test('handles service errors', async () => {
    const response = await agent
      .post('/api/user/change')
      .send({ oldPassword: 'invalid', password: '22222Aab', confirmedPassword: '22222Aab' })
    expect(response.body).toStrictEqual({ 'message': 'Password is incorrect', 'status': 'error' })
    expect(response.statusCode).toBe(500)
  })
  test('responds with success status code after changing password', async () => {   
    const response = await agent
      .post('/api/user/change')
      .send({ oldPassword: password, password: '22222Aab', confirmedPassword: '22222Aab' })
    expect(response.statusCode).toBe(200)
  })
})


