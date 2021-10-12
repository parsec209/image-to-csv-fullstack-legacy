const connectDB = require('../loaders/db')
const setupApp = require('../loaders/app')
const request = require('supertest')
const { v4: uuidv4 } = require('uuid')
const { validate: uuidValidate } = require('uuid')
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


beforeAll(async () => {
  dbConnection = await connectDB()
  app = setupApp(dbConnection)
  agent = request.agent(app)
  userID = await getUserID()
  await login()
})


afterAll(async () => {
  await bucket.deleteFiles()
  await dbConnection.dropDatabase()
  await dbConnection.close()
  console.log('Database connection closed')
})


describe('POST /api/transfers/upload', () => {
  test('responds with fileBatchID after successful uploads', async () => {
    const fileBatchID = await agent
      .post('/api/transfers/upload')
      .attach('myFiles', __dirname + '/seeds/uploads/cloud/validExts/GIF.GIF') 
    expect(uuidValidate(fileBatchID.body)).toBe(true)
    expect(fileBatchID.statusCode).toBe(200)
  })
  test('rejects if no files sent', async () => {
    const response = await agent
      .post('/api/transfers/upload')
    expect(response.body).toStrictEqual({ 'message': 'No file chosen. Please select a file to upload', 'status': 'fail' })
    expect(response.statusCode).toBe(400)
  })
  test('handles incorrect file type', async () => {
    const response = await agent
      .post('/api/transfers/upload')
      .attach('myFiles', __dirname + '/seeds/uploads/cloud/invalidExts/TXT.txt')
    expect(response.body).toStrictEqual({ 'message': 'File format not supported. Accepted file formats: pdf, gif, tif', 'status': 'fail' })
    expect(response.statusCode).toBe(415)
  })
  test('handles MulterError (i.e. file too large)', async () => {
    const response = await agent
      .post('/api/transfers/upload')
      .attach('myFiles', __dirname + `/seeds/uploads/largeFile.tiff`)
    expect(response.body).toStrictEqual({ 'message': 'File too large', 'status': 'fail' })
    expect(response.statusCode).toBe(500)
  })
})


describe('POST /api/transfers/extract', () => {
  test('responds with doc identification status', async () => {
    const fileBatchID = uuidv4()
    await bucket.upload(__dirname + '/seeds/uploads/cloud/validExts/GIF.GIF', { destination: `${userID}/${fileBatchID}/uploads/GIF.GIF`, metadata: { contentType: 'image/gif' }})
    const response = await agent
      .post('/api/transfers/extract')
      .send({
        fileBatchID, 
        pageSelections: [1],
        dateToday: '2020/09/14'
      })
    const expected = { identifiedDocs: [], unidentifiedDocs: ['GIF.GIF'] }
    expect(response.body).toStrictEqual(expected)
    expect(response.statusCode).toBe(200)
  })
  test('handles request body validation errors (invalid fileBatchID)', async () => {
    const response = await agent
      .post('/api/transfers/extract')
      .send({
        fileBatchID: 'invalid', 
        pageSelections: [1],
        dateToday: '2020/09/14'
      })
    expect(response.body).toStrictEqual({ 'message': 'Request body error: "fileBatchID" must be a valid GUID', 'status': 'fail' })
    expect(response.statusCode).toBe(400)
  })
  test('handles invalid page error', async () => {
    const fileBatchID = uuidv4()
    await bucket.upload(__dirname + '/seeds/uploads/cloud/validExts/GIF.GIF', { destination: `${userID}/${fileBatchID}/uploads/GIF.GIF`, metadata: { contentType: 'image/gif' }})
    const response = await agent
      .post('/api/transfers/extract')
      .send({
        fileBatchID, 
        pageSelections: [1000],
        dateToday: '2020/09/14'
      })
    expect(response.body).toStrictEqual({ 'message': 'None of the selected pages match an actual document page in this batch', 'status': 'fail' })
    expect(response.statusCode).toBe(500)
  })
})


describe('POST /api/transfers/write', () => {
  test('responds with zip URL', async () => {
    const fileBatchID = uuidv4()
    await Promise.all([0, 1].map(async fileNumber => 
      await bucket.upload(__dirname + `/seeds/downloads/${fileNumber}.csv`, { destination: `${userID}/${fileBatchID}/downloads/${fileNumber}.csv` }) 
    ))
    const response = await agent
      .post('/api/transfers/write')
      .send({
        fileBatchID
      })
    expect(response.body).toEqual(expect.stringContaining(`https://storage.googleapis.com/invoices6293_dev/${userID}/${fileBatchID}/downloads/CSVFiles.zip`))
    expect(response.statusCode).toBe(200)
  })
  test('handles request body validation errors (invalid fileBatchID)', async () => {
    const response = await agent
      .post('/api/transfers/write')
      .send({
        fileBatchID: 'invalid'
      })
    expect(response.body).toStrictEqual({ 'message': 'Request body error: "fileBatchID" must be a valid GUID', 'status': 'fail' })
    expect(response.statusCode).toBe(400)
  })
  test('handles zip creation error (i.e. fileBatchID does not exist in GCP)', async () => {
    const response = await agent
      .post('/api/transfers/write')
      .send({
        fileBatchID: uuidv4()
      })
    expect(response.body).toStrictEqual({ 'message': 'Unable to create zip file due to either file batch ID or CSV files not existing', 'status': 'fail' })
    expect(response.statusCode).toBe(404)
  })
})




