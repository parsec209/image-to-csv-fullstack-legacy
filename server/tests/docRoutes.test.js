const connectDB = require('../loaders/db')
const setupApp = require('../loaders/app')
const request = require('supertest')
const Doc = require('../models/doc')
const PostService = require('../services/postService')
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
  await dbConnection.dropDatabase()
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
    expect(doc.body).toHaveProperty('_id')
    expect(doc.body).toHaveProperty('name')
    expect(doc.body).toHaveProperty('idPhrase')
    expect(doc.body).toHaveProperty('header')
    expect(doc.body).toHaveProperty('dataRows')
    expect(doc.body).toHaveProperty('user')
    expect(doc.body).toHaveProperty('__v')
    expect(doc.statusCode).toBe(200)
  })
  test('handles request parameter validation error', async () => {
    const doc = await agent
      .get('/api/docs/A')
    expect(doc.body).toStrictEqual({ 'message': 'Request paramater error: "value" with value "A" fails to match the required pattern: /^[a-z0-9]+$/', 'status': 'fail' })
    expect(doc.statusCode).toBe(400)
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
  test('throws error if doc ID not found', async () => {
    const doc = await agent
      .get(`/api/docs/${new mongoose.Types.ObjectId()}`)
    expect(doc.body).toStrictEqual({'message': 'No doc found with that ID', 'status': 'fail'})
    expect(doc.statusCode).toBe(404)
  })
  test('handles cast error for request param', async () => {
    const doc = await agent
      .get('/api/docs/abc123')
    expect(doc.body).toStrictEqual({ 'message': 'Cast to ObjectId failed for value "abc123" (type string) at path "_id" for model "Doc"', 'status': 'fail' })
    expect(doc.statusCode).toBe(500)
  })
})


describe('POST /api/docs', () => {
  test('posts doc and responds with doc object', async () => {
    const doc = await agent
      .post('/api/docs')
      .send({ name: 'validPostTest', idPhrase: 'postPhrase896342', header: [{ value: 'headercell' }], dataRows: [{ dataCells: [{ cellSects: [{}]}]}]})
    expect(doc.body).toHaveProperty('_id')
    expect(doc.body).toHaveProperty('name')
    expect(doc.body).toHaveProperty('idPhrase')
    expect(doc.body).toHaveProperty('header')
    expect(doc.body).toHaveProperty('dataRows')
    expect(doc.body).toHaveProperty('user')
    expect(doc.statusCode).toBe(200)
  })
  test('handles request body validation error  (i.e. invalid cellSects length)', async () => {
    const doc = await agent
      .post('/api/docs')
      .send({ name: 'invalidReqTest', idPhrase: 'postPhrase83314670', header: [{ value: 'headercell' }], dataRows: [{ dataCells: [{ cellSects: []}]}]})
    expect(doc.body).toStrictEqual({'message': 'Request body error: "dataRows[0].dataCells[0].cellSects" does not contain 1 required value(s)', 'status': 'fail'})
    expect(doc.statusCode).toBe(400)
  }) 
  test('handles duplicate doc name error', async () => {
    const existingDoc = await agent.get(`/api/docs/${docID}`)
    const existingName = existingDoc.body.name
    const doc2 = await agent
      .post('/api/docs')
      .send({ name: existingName, idPhrase: 'postPhrase87231543', header: [{ value: 'headercell' }], dataRows: [{ dataCells: [{ cellSects: [{}]}]}]})
    expect(doc2.body).toStrictEqual({'message': `The following name has already been used: ${existingName}`, 'status': 'fail'})
    expect(doc2.statusCode).toBe(500)
  })
  test('handles duplicate id phrase error', async () => {
    const existingDoc = await agent.get(`/api/docs/${docID}`)
    const existingIDPhrase = existingDoc.body.idPhrase
    const doc2 = await agent
      .post('/api/docs')
      .send({ name: 'dupIDPostTest', idPhrase: existingIDPhrase, header: [{ value: 'headercell' }], dataRows: [{ dataCells: [{ cellSects: [{}]}]}]})
    expect(doc2.body).toStrictEqual({'message': `The following ID phrase has already been used: ${existingIDPhrase}`, 'status': 'fail'})
    expect(doc2.statusCode).toBe(500)
  })
  test('handles post validation error', async () => {
    const cellSect = { searchOrInputMethod: 'today', phraseOrValue: 'sectPhrase' }
    const doc = await agent
      .post('/api/docs')
      .send({ name: 'postValidationErr', idPhrase: 'postPhrase521009642', header: [{ value: 'headercell' }], dataRows: [{ dataCells: [{ cellSects: [cellSect]}]}]})
    expect(doc.body).toStrictEqual({'message': 'Doc validation failed: dataRows.0.dataCells.0.cellSects.0.phraseOrValue: PhraseOrValue cannot be included when the searchOrInputMethod is "today"', 'status': 'fail'})
    expect(doc.statusCode).toBe(500)
  })
})


describe('PUT /api/docs/:id', () => {  
  test('updates doc and responds with doc object (optional object ids in header cells, data rows, and data cells)', async () => {
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
  test('handles request body validation error (i.e. invalid rows length)', async () => {
    const doc = await agent
      .put(`/api/docs/${docID}`)
      .send({ name: 'invalidTest', idPhrase: 'postPhrase', header: [{ value: 'headercell' }], dataRows: [] })
    expect(doc.body).toStrictEqual({'message': 'Request body error: "dataRows" does not contain 1 required value(s)', 'status': 'fail'})
    expect(doc.statusCode).toBe(400)
  })
  test('handles cast error for ObjectId', async () => {
    const doc = await agent
      .put(`/api/docs/${docID}`)
      .send({ name: 'invalidObjectID', idPhrase: 'postPhrase78555312', header: [{ value: 'headercell' }], dataRows: [{ dataCells: [{ _id: 'abc123', cellSects: [{}]}]}]})
    expect(doc.body).toStrictEqual({'message': 'Doc validation failed: dataRows.0.dataCells.0._id: Cast to ObjectId failed for value "abc123" (type string) at path "_id"', 'status': 'fail'})
    expect(doc.statusCode).toBe(500)
  })
  test('handles duplicate doc name error', async () => {
    const existingDoc = await agent.get(`/api/docs/${docID}`)
    const existingName = existingDoc.body.name
    const newDoc = await agent
      .post('/api/docs')
      .send({ name: 'dupNameTest77705318', idPhrase: 'phrase99873456', header: [{ value: 'headercell' }], dataRows: [{ dataCells: [{ cellSects: [{}]}]}]})
    const newDocID = newDoc.body._id
    const updated = await agent
      .put(`/api/docs/${newDocID}`)
      .send({ name: existingName, idPhrase: 'phrase99873456', header: [{ value: 'headercell' }], dataRows: [{ dataCells: [{ cellSects: [{}]}]}]})
    expect(updated.body).toStrictEqual({'message': `The following name has already been used: ${existingName}`, 'status': 'fail'})
    expect(updated.statusCode).toBe(500)
  })
  test('handles duplicate id phrase error', async () => {
    const existingDoc = await agent.get(`/api/docs/${docID}`)
    const existingIDPhrase = existingDoc.body.idPhrase
    const newDoc = await agent
      .post('/api/docs')
      .send({ name: 'dupIDTest66319907', idPhrase: 'phrase87621453', header: [{ value: 'headercell' }], dataRows: [{ dataCells: [{ cellSects: [{}]}]}]})
    const newDocID = newDoc.body._id
    const updated = await agent
      .put(`/api/docs/${newDocID}`)
      .send({ name: 'dupIDTest66319907', idPhrase: existingIDPhrase, header: [{ value: 'headercell' }], dataRows: [{ dataCells: [{ cellSects: [{}]}]}]})
    expect(updated.body).toStrictEqual({'message': `The following ID phrase has already been used: ${existingIDPhrase}`, 'status': 'fail'})
    expect(updated.statusCode).toBe(500)
  })
})


describe('DELETE /api/docs/:id', () => {  
  test('deletes doc and responds with doc object', async () => {
    const doc = await agent
      .delete(`/api/docs/${docID}`)
      expect(doc.body).toHaveProperty('_id')
      expect(doc.body).toHaveProperty('name')
      expect(doc.body).toHaveProperty('idPhrase')
      expect(doc.body).toHaveProperty('header')
      expect(doc.body).toHaveProperty('dataRows')
      expect(doc.body).toHaveProperty('user')
      expect(doc.statusCode).toBe(200)
  })
  test('handles request parameter validation error', async () => {
    const doc = await agent
      .delete('/api/docs/A')
    expect(doc.body).toStrictEqual({ 'message': 'Request paramater error: "value" with value "A" fails to match the required pattern: /^[a-z0-9]+$/', 'status': 'fail' })
    expect(doc.statusCode).toBe(400)
  })
})






