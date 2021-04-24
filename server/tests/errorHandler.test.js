const connectDB = require('../loaders/db')
const setupApp = require('../loaders/app')
const request = require('supertest')
const PostService = require('../services/PostService')
const Header = require('../models/header')
const fsPromises = require('fs').promises
const { v4: uuidv4 } = require('uuid')
const {Storage} = require('@google-cloud/storage')
const storage = new Storage()
const bucket = storage.bucket(process.env.STORAGE_BUCKET)



const creds = { username: uuidv4(), email: `${uuidv4()}@test.com`, password: '11111Aab', confirmedPassword: '11111Aab', invitationCode: process.env.INVITATION_CODE }
let dbConnection
let app
let agent
let userID


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


const postHeader = async () => {
  const headerSchemasSeed = await fsPromises.readFile(__dirname + '/seeds/database/headers.json')
  const headerSchemas = JSON.parse(headerSchemasSeed)
  const postService = new PostService(Header)
  await postService.post({ ...headerSchemas, user: { id: userID }})
}


beforeAll(async () => {
  dbConnection = await connectDB()
  app = setupApp(dbConnection)
  agent = request.agent(app)
  userID = await getUserID()
  await postHeader()
  await login()
})


afterAll(async () => {
  await dbConnection.dropDatabase()
  await dbConnection.close()
  console.log('Database connection closed')
})


describe('handling trusted API errors as operational errors', () => {

  describe('handling mongoose errors', () => {
    test('handles CastError (invalid req.params)', async () => {
      const header = await agent
        .get('/api/headers/invalid')
      expect(header.body.message).toBe('Cast to ObjectId failed for value "invalid" at path "_id" for model "Header"')
      expect(header.body.status).toBe('error')
      expect(header.statusCode).toBe(500)
    })
    test('handles ValidationError', async () => {
      const name = 'validationTest'
      const cells = []
      const header = await agent
        .post('/api/headers')
        .send({ name, cells })
      expect(header.body.message).toBe('Header validation failed: cells: Must have between one and 52 header cells')
      expect(header.body.status).toBe('error')
      expect(header.statusCode).toBe(500)
    })
    test('handles 11000 code (duplicate key error)', async () => {
      let name = 'name'
      let cells = [{ value: 'cell' }]
      let header = await agent
        .post('/api/headers')
        .send({ name, cells })
      //testing second header post with duplicate name 
      name = 'name'
      cells = [{ value: 'cell' }]
      header = await agent
        .post('/api/headers')
        .send({ name, cells })
      expect(header.body.message).toBe('The following name has already been used: name')
      expect(header.body.status).toBe('fail')
      expect(header.statusCode).toBe(400)
    })
    test('handles UserExistsError (passport-local-mongoose)', async () => {
      const user = await request(app)
        .post('/api/user/register')
        .send(creds)
      expect(user.body.message).toBe('A user with the given username is already registered')
      expect(user.body.status).toBe('error')
      expect(user.statusCode).toBe(500)
    })
  })
  
  describe('handling MulterError', () => {
    test('handles large file error', async () => {
      const response = await agent
        .post('/api/transfers/upload')
        .attach('myFiles', __dirname + `/seeds/uploads/largeFile.tiff`)
      expect(response.body.message).toBe('File too large')
      expect(response.body.status).toBe('error')
      expect(response.statusCode).toBe(500)
    })
  })

  describe('handling GCP error', () => {
    test('handles invalid page selections', async () => {
      const fileBatchID = uuidv4()
      await bucket.upload(__dirname + '/seeds/uploads/cloud/validExts/GIF.GIF', { destination: `${userID}/uploads/${fileBatchID}/GIF.GIF`, metadata: { contentType: 'image/gif' }})
      const response = await agent
        .post('/api/transfers/extract')
        .send({
          fileBatchID, 
          pageSelections: [1000],
          dateToday: '2020/09/14'
        })
      expect(response.body.message).toBe('3 INVALID_ARGUMENT: No pages found.')
      expect(response.body.status).toBe('error')
      expect(response.statusCode).toBe(500)
    })
  })
})