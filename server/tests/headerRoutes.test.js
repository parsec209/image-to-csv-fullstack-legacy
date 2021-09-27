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
    expect(header.body).toHaveProperty('_id')
    expect(header.body).toHaveProperty('cells')
    expect(header.body).toHaveProperty('user')
    expect(header.body).toHaveProperty('__v')
    expect(header.statusCode).toBe(200)
  })
  test('handles request parameter validation error', async () => {
    const header = await agent
      .get('/api/headers/A')
    expect(header.body).toStrictEqual({ 'message': 'Request paramater error: "value" with value "A" fails to match the required pattern: /^[a-z0-9]+$/', 'status': 'fail' })
    expect(header.statusCode).toBe(400)
  })
  test('handles header not found error', async () => {
    const header = await agent
      .get(`/api/headers/${new mongoose.Types.ObjectId()}`)
    expect(header.body).toStrictEqual({'message': 'No header found with that ID', 'status': 'fail'})
    expect(header.statusCode).toBe(404)
  })
  test('handles unauthorized error', async () => {
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
  test('handles cast error for request param', async () => {
    const header = await agent
      .get('/api/headers/abc123')
    expect(header.body).toStrictEqual({ 'message': 'Cast to ObjectId failed for value "abc123" (type string) at path "_id" for model "Header"', 'status': 'fail' })
    expect(header.statusCode).toBe(500)
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
    expect(header.body).toHaveProperty('_id')
    expect(header.body).toHaveProperty('__v')
    expect(header.statusCode).toBe(200)
  })
  test('handles request body validation error (i.e. invalid cells length)', async () => {
    const name = 'invalidPostTest'
    const cells = []
    const header = await agent
      .post('/api/headers')
      .send({ name, cells })
    expect(header.body).toStrictEqual({'message': 'Request body error: "cells" must contain at least 1 items', 'status': 'fail'})
    expect(header.statusCode).toBe(400)
  })
  test('handles duplicate header name error', async () => {
    const name = 'nameDupTest'
    const cells = [{ value: 'cell' }]
    await agent
      .post('/api/headers')
      .send({ name, cells })
    const name2 = 'nameDupTest'
    const cells2 = [{ value: 'cell' }]
    const header2 = await agent
      .post('/api/headers')
      .send({ name: name2, cells: cells2 })
    expect(header2.body).toStrictEqual({'message': 'The following name has already been used: nameDupTest', 'status': 'fail'})
    expect(header2.statusCode).toBe(500)
  })
})


describe('PUT /api/headers/:id', () => {  
  test('updates header and responds with header object', async () => {
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
  test('handles request body validation error (i.e. duplicate cell values)', async () => {
    const name = 'invalidUpdateTest'
    const cells = [
      { value: 'newHeaderCell' },
      { value: 'newHeaderCell' }
    ]
    const header = await agent
      .put(`/api/headers/${headerID}`)
      .send({ name, cells })
    expect(header.body).toStrictEqual({'message': 'Request body error: "cells[1]" contains a duplicate value', 'status': 'fail'})
    expect(header.statusCode).toBe(400)
  })
  test('handles duplicate header name error', async () => {
    const name = 'nameDupTest'
    const cells = [{ value: 'cell' }]
    await agent
      .post('/api/headers/')
      .send({ name, cells })
    const name2 = 'nameDupTest'
    const cells2 = [{ value: 'cell' }]
    const header2 = await agent
      .put(`/api/headers/${headerID}`)
      .send({ name: name2, cells: cells2 })
    expect(header2.body).toStrictEqual({'message': 'The following name has already been used: nameDupTest', 'status': 'fail'})
    expect(header2.statusCode).toBe(500)
  })
  test('handles cast error for header cell ID', async () => {
    const name = 'updateTest'
    const cells = [
      { value: 'newHeaderCell11' },
      { _id: 'invalid', value: 'newHeaderCell22' }
    ]
    const header = await agent
      .put(`/api/headers/${headerID}`)
      .send({ name, cells })
    expect(header.body).toStrictEqual({'message': 'Header validation failed: cells.1._id: Cast to ObjectId failed for value "invalid" (type string) at path "_id"', 'status': 'fail'})
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
    expect(header.body).toHaveProperty('_id')
    expect(header.body).toHaveProperty('__v')
    expect(header.statusCode).toBe(200)
  })
  test('handles request parameter validation error', async () => {
    const header = await agent
      .delete('/api/headers/A')
    expect(header.body).toStrictEqual({ 'message': 'Request paramater error: "value" with value "A" fails to match the required pattern: /^[a-z0-9]+$/', 'status': 'fail' })
    expect(header.statusCode).toBe(400)
  })
})






