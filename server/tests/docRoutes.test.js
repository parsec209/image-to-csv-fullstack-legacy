const connectDB = require('../loaders/db')
const setupApp = require('../loaders/app')
const request = require('supertest')
const Doc = require('../models/doc')
const PostService = require('../services/PostService')
const fsPromises = require('fs').promises
const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')



const creds = { username: uuidv4(), email: `${uuidv4()}@test.com`, password: '11111Aab', confirmedPassword: '11111Aab', invitationCode: process.env.INVITATION_CODE }
let dbConnection
let app
let agent
let userID
let docID


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


const getDocID = async () => {
  const recurringDocsSeed = await fsPromises.readFile(__dirname + '/seeds/database/docs.json')
  const recurringDocs = JSON.parse(recurringDocsSeed)
  const postService = new PostService(Doc)
  const doc = await postService.post({ ...recurringDocs[0], user: { id: userID }})
  return doc._id
}


beforeAll(async () => {
  dbConnection = await connectDB()
  app = setupApp(dbConnection)
  agent = request.agent(app)
  userID = await getUserID()
  docID = await getDocID()
  await login()
})


afterAll(async () => {
  await dbConnection.dropCollection('users')
  await dbConnection.dropCollection('docs')
  await dbConnection.dropCollection('headers')
  await dbConnection.dropCollection('sessions')
  await dbConnection.close()
  console.log('Database connection closed')
})


describe('GET /api/docs', () => {
  test('responds with all docs', async () => {
    const docs = await agent
      .get('/api/docs')
    expect(docs.body).toHaveLength(1)
    expect(docs.statusCode).toBe(200)
  })
})


describe('GET /api/docs/:id', () => {
  test('responds with doc', async () => {
    const doc = await agent
      .get(`/api/docs/${docID}`)
    expect(doc.body).toHaveProperty('name')
    expect(doc.body).toHaveProperty('idPhrase')
    expect(doc.body).toHaveProperty('header')
    expect(doc.body).toHaveProperty('dataRows')
    expect(doc.body).toHaveProperty('user')
    expect(doc.statusCode).toBe(200)
  })
  test('throws error if doc ID not found', async () => {
    const doc = await agent
      .get(`/api/docs/${new mongoose.Types.ObjectId()}`)
    expect(doc.body).toStrictEqual({'message': 'No doc found with that ID', 'status': 'fail'})
    expect(doc.statusCode).toBe(404)
  })
  test('throws error if not authorized to access doc', async () => {
    const newAgent = request.agent(app)
    const newCreds = { username: uuidv4(), email: `${uuidv4()}@test.com`, password: '11111Aab', confirmedPassword: '11111Aab', invitationCode: process.env.INVITATION_CODE }
    await request(app)
      .post('/api/user/register')
      .send(newCreds)
    await newAgent
      .post('/api/user/login')
      .send({ username: newCreds.username, password: newCreds.password })
    const doc = await newAgent
      .get(`/api/docs/${docID}`)
    expect(doc.body).toStrictEqual({'message': 'Not authorized to access doc', 'status': 'fail'})
    expect(doc.statusCode).toBe(403)
  })
})


describe('POST /api/docs', () => {
  test('posts doc and responds with doc object', async () => {
    const name = 'postTest'
    const idPhrase = 'postPhrase'
    const header = [{ value: 'headercell' }]
    const dataRows = [
      { dataCells: [ 
        { cellSects: 
          [{}]
        }
      ]}
    ]
    const doc = await agent
      .post('/api/docs')
      .send({ name, idPhrase, header, dataRows })
    expect(doc.body).toHaveProperty('name')
    expect(doc.body).toHaveProperty('idPhrase')
    expect(doc.body).toHaveProperty('header')
    expect(doc.body).toHaveProperty('dataRows')
    expect(doc.body).toHaveProperty('user')
    expect(doc.statusCode).toBe(200)
  })
  test('handles service errors (i.e. invalid cellSects length)', async () => {
    const name = 'invalidTest'
    const idPhrase = 'postPhrase'
    const header = [{ value: 'headercell' }]
    const dataRows = [
      { dataCells: [ 
        { cellSects: 
          []
        }
      ]}
    ]
    const doc = await agent
      .post('/api/docs')
      .send({ name, idPhrase, header, dataRows })
    expect(doc.body).toStrictEqual({'message': 'Doc validation failed: dataRows.0.dataCells.0.cellSects: Must have between one and four cell sections per data cell', 'status': 'error'})
    expect(doc.statusCode).toBe(500)
  }) 
  
  describe('handles Express validation errors', () => {
    test('handles invalid name', async () => {
      const name = 0
      const idPhrase = 'postPhrase'
      const header = [{ value: 'headercell' }]
      const dataRows = [
        { dataCells: [ 
          { cellSects: 
            [{}]
          }
        ]}
      ]
      const doc = await agent
        .post('/api/docs')
        .send({ name, idPhrase, header, dataRows })
      expect(doc.body).toStrictEqual({'message': 'Missing string in request body: name', 'status': 'fail'})
      expect(doc.statusCode).toBe(400)
    })
    test('handles invalid idPhrase', async () => {
      const name = 'postTest'
      const idPhrase = 0
      const header = [{ value: 'headercell' }]
      const dataRows = [
        { dataCells: [ 
          { cellSects: 
            [{}]
          }
        ]}
      ]
      const doc = await agent
        .post('/api/docs')
        .send({ name, idPhrase, header, dataRows })
      expect(doc.body).toStrictEqual({'message': 'Missing string in request body: idPhrase', 'status': 'fail'})
      expect(doc.statusCode).toBe(400)
    })
    test('handles invalid header', async () => {
      const name = 'postTest'
      const idPhrase = 'postPhrase'
      const header = [0]
      const dataRows = [
        { dataCells: [ 
          { cellSects: 
            [{}]
          }
        ]}
      ]
      const doc = await agent
        .post('/api/docs')
        .send({ name, idPhrase, header, dataRows })
      expect(doc.body).toStrictEqual({'message': 'header must be an array containing one or more objects formatted as { "_id": "string", "value": "string" } (_id is optional)', 'status': 'fail'})
      expect(doc.statusCode).toBe(400)
    })
    test('handles invalid dataRows', async () => {
      const name = 'postTest'
      const idPhrase = 'postPhrase'
      const header = [{ value: 'headercell' }]
      const dataRows = [
        { dataCells: [ 
          { invalidProperty: 
            [{}]
          }
        ]}
      ]
      const doc = await agent
        .post('/api/docs')
        .send({ name, idPhrase, header, dataRows })
      expect(doc.body).toStrictEqual({'message': 'dataRows must be an array containing one or more objects formatted as { "_id": "string", "dataCells": [{ "_id": "string", "cellSects": [Object] }]} (_id is optional)', 'status': 'fail'})
      expect(doc.statusCode).toBe(400)
    })
  })
})


describe('PUT /api/docs/:id', () => {  
  test('updates doc and responds with doc object (optional mongoose ids in header cells, data rows, and data cells)', async () => {
    const name = 'GIF.GIF'
    const idPhrase = '564'
    const header = [{ value: 'updatedCell' }, { _id: '5fd92d982fef5c0db40fb918', value: 'updatedCell2' }]
    const dataRows = [
      { _id: '5fd92da22fef5c0db40fb91b', dataCells: [ 
        { _id: '5fdc69bbe6f10a4838f7c199', cellSects: [
          { searchOrInputMethod: 'today' }
        ]},
        { _id: '5fdc69bbe6f10a4838f7c198', cellSects: [
          { searchOrInputMethod: 'today' }
        ]}
      ]},
      { dataCells: [ 
        { cellSects: [
          { searchOrInputMethod: 'today' }
        ]},
        { cellSects: [
          { searchOrInputMethod: 'today' }
        ]}
      ]}
    ]
    const doc = await agent
      .put(`/api/docs/${docID}`)
      .send({ name, idPhrase, header, dataRows })
    expect(doc.body.name).toBe('GIF.GIF')
    expect(doc.body.idPhrase).toBe('564')
    expect(doc.body.header[0].value).toBe('updatedCell')
    expect(doc.body.header[1].value).toBe('updatedCell2')
    expect(doc.body.dataRows[0].dataCells[0].cellSects[0].searchOrInputMethod).toBe('today')
    expect(doc.body.dataRows[0].dataCells[1].cellSects[0].searchOrInputMethod).toBe('today')
    expect(doc.body.dataRows[1].dataCells[0].cellSects[0].searchOrInputMethod).toBe('today')
    expect(doc.body.dataRows[1].dataCells[1].cellSects[0].searchOrInputMethod).toBe('today')
    expect(doc.statusCode).toBe(200)
  })
  test('handles service errors (i.e. invalid rows length)', async () => {
    const name = 'invalidTest'
    const idPhrase = 'postPhrase'
    const header = [{ value: 'headercell' }]
    const dataRows = []
    const doc = await agent
      .post('/api/docs')
      .send({ name, idPhrase, header, dataRows })
    expect(doc.body).toStrictEqual({'message': 'Doc validation failed: dataRows: Must have between one and 100 data rows', 'status': 'error'})
    expect(doc.statusCode).toBe(500)
  })
})


describe('DELETE /api/docs/:id', () => {  
  test('deletes doc and responds with doc object', async () => {
    const doc = await agent
      .delete(`/api/docs/${docID}`)
      expect(doc.body).toHaveProperty('name')
      expect(doc.body).toHaveProperty('idPhrase')
      expect(doc.body).toHaveProperty('header')
      expect(doc.body).toHaveProperty('dataRows')
      expect(doc.body).toHaveProperty('user')
      expect(doc.statusCode).toBe(200)
  })
})






