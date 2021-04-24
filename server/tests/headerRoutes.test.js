const connectDB = require('../loaders/db')
const setupApp = require('../loaders/app')
const request = require('supertest')
const Header = require('../models/header')
const PostService = require('../services/PostService')
const fsPromises = require('fs').promises
const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')



const creds = { username: uuidv4(), email: `${uuidv4()}@test.com`, password: '11111Aab', confirmedPassword: '11111Aab', invitationCode: process.env.INVITATION_CODE }
let dbConnection
let app
let agent
let userID
let headerID


const getUserID = async () => {
  const user = await request(app)
    .post('/api/user/register')
    .send(creds)
  return user.body._id
}


const login = async () => {
  await agent
    .post('/api/user/login')
    .send({ username: creds.username, password: creds.password })
}


const getHeaderID = async () => {
  const headerSchemasSeed = await fsPromises.readFile(__dirname + '/seeds/database/headers.json')
  const headerSchemas = JSON.parse(headerSchemasSeed)
  const postService = new PostService(Header)
  const header = await postService.post({ ...headerSchemas, user: { id: userID }})
  return header._id
}


beforeAll(async () => {
  dbConnection = await connectDB()
  app = setupApp(dbConnection)
  agent = request.agent(app)
  userID = await getUserID()
  headerID = await getHeaderID()
  await login()
})


afterAll(async () => {
  await dbConnection.dropDatabase()
  await dbConnection.close()
  console.log('Database connection closed')
})


describe('GET /api/headers', () => {
  test('responds with all headers', async () => {
    const headers = await agent
      .get('/api/headers')
    expect(headers.body).toHaveLength(1)
    expect(headers.statusCode).toBe(200)
  })
})


describe('GET /api/headers/:id', () => {
  test('responds with header', async () => {
    const header = await agent
      .get(`/api/headers/${headerID}`)
    expect(header.body).toHaveProperty('name')
    expect(header.body).toHaveProperty('cells')
    expect(header.body).toHaveProperty('user')
    expect(header.statusCode).toBe(200)
  })
  test('throws error if header ID not found', async () => {
    const header = await agent
      .get(`/api/headers/${new mongoose.Types.ObjectId()}`)
    expect(header.body).toStrictEqual({'message': 'No header found with that ID', 'status': 'fail'})
    expect(header.statusCode).toBe(404)
  })
  test('throws error if not authorized to access header', async () => {
    const newAgent = request.agent(app)
    const newCreds = { username: uuidv4(), email: `${uuidv4()}@test.com`, password: '11111Aab', confirmedPassword: '11111Aab', invitationCode: process.env.INVITATION_CODE }
    await request(app)
      .post('/api/user/register')
      .send(newCreds)
    await newAgent
      .post('/api/user/login')
      .send({ username: newCreds.username, password: newCreds.password })
    const header = await newAgent
      .get(`/api/headers/${headerID}`)
    expect(header.body).toStrictEqual({'message': 'Not authorized to access header', 'status': 'fail'})
    expect(header.statusCode).toBe(403)
  })
})


describe('POST /api/headers', () => {
  test('posts header and responds with header object', async () => {
    const name = 'postTest'
    const cells = [{ value: 'cell' }]
    const header = await agent
      .post('/api/headers')
      .send({ name, cells })
    expect(header.body).toHaveProperty('name')
    expect(header.body).toHaveProperty('cells')
    expect(header.body).toHaveProperty('user')
    expect(header.statusCode).toBe(200)
  })
  test('handles service errors (i.e. invalid cells length)', async () => {
    const name = 'invalidPostTest'
    const cells = []
    const header = await agent
      .post('/api/headers')
      .send({ name, cells })
    expect(header.body).toStrictEqual({'message': 'Header validation failed: cells: Must have between one and 52 header cells', 'status': 'error'})
    expect(header.statusCode).toBe(500)
  })
  
  describe('handles Express validation errors', () => {
    test('handles invalid cells format', async () => {
      const name = 'invalidPostTest'
      const cells = [{ value: 0 }]
      const header = await agent
        .post('/api/headers')
        .send({ name, cells })
      expect(header.body).toStrictEqual({'message': 'cells must be an array containing one or more objects formatted as { "_id": "string", "value": "string" } (_id is optional)', 'status': 'fail'})
      expect(header.statusCode).toBe(400)
    })
    test('rejects if name is invalid data type', async () => {
      const name = 0
      const cells = [{ value: 'cell' }]
      const header = await agent
        .post('/api/headers')
        .send({ name, cells })
      expect(header.body).toStrictEqual({'message': 'Missing string in request body: name', 'status': 'fail'})
      expect(header.statusCode).toBe(400)
    })
  })
})


describe('PUT /api/headers/:id', () => {  
  test('updates header and responds with header object (optional mongoose ids in header cells)', async () => {
    const name = 'updateTest'
    const cells = [
      { value: 'newHeaderCell1' },
      { _id: '5fd92d982fef5c0db40fb918', value: 'newHeaderCell2' }
    ]
    const header = await agent
      .put(`/api/headers/${headerID}`)
      .send({ name, cells })
    expect(header.body.name).toBe('updateTest')
    expect(header.body.cells[0].value).toBe('newHeaderCell1')
    expect(header.body.cells[1].value).toBe('newHeaderCell2')
    expect(header.statusCode).toBe(200)
  })
  test('handles service errors (i.e. duplicate cell values)', async () => {
    const name = 'invalidUpdateTest'
    const cells = [
      { value: 'newHeaderCell' },
      { value: 'newHeaderCell' }
    ]
    const header = await agent
      .put(`/api/headers/${headerID}`)
      .send({ name, cells })
    expect(header.body).toStrictEqual({'message': 'Header validation failed: cells: Duplicate header cell values not allowed', 'status': 'error'})
    expect(header.statusCode).toBe(500)
  })
})


describe('DELETE /api/headers/:id', () => {  
  test('deletes header and responds with header object', async () => {
    const header = await agent
      .delete(`/api/headers/${headerID}`)
    expect(header.body).toHaveProperty('name')
    expect(header.body).toHaveProperty('cells')
    expect(header.body).toHaveProperty('user')
    expect(header.statusCode).toBe(200)
  })
})






