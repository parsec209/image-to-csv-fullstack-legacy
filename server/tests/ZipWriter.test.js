const connectDB = require('../loaders/db')
const {Storage} = require('@google-cloud/storage')
const storage = new Storage()
const bucket = storage.bucket(process.env.STORAGE_BUCKET)
const ZipWriter = require('../services/ZipWriter')
const { v4: uuidv4 } = require('uuid')
const User = require('../models/user')



let dbConnection


const getUser = async () => {
  const user = new User({ username: uuidv4(), email: `${uuidv4()}@test.com`, password: 'testPassword1234' })
  await user.save()
  return user
}


const uploadCSVFiles = async (userID, fileBatchID) => {
  await Promise.all([0, 1].map(async fileNumber => {
    await bucket.upload(__dirname + `/seeds/downloads/${fileNumber}.csv`, { destination: `${userID}/downloads/${fileBatchID}/${fileNumber}.csv` }) 
  }))
}


beforeAll(async () => {
  dbConnection = await connectDB()
})


afterAll(async () => {
  await bucket.deleteFiles()
  await dbConnection.dropDatabase()
  await dbConnection.close()
  console.log('Database connection closed')
})


describe('instantiates ZipWriter', () => {
  test('initializes constructor', async () => {
    const user = await getUser()
    const IPAddress = uuidv4()
    const fileBatchID = uuidv4()
    const zipWriter = new ZipWriter(user, IPAddress, fileBatchID)
    expect(zipWriter.user).toBeTruthy()
    expect(zipWriter.IPAddress).toBeTruthy()
    expect(zipWriter.fileBatchID).toBeTruthy()
  })
})


describe('creating and providing access to zipped CSV files in GCP', () => {

  let user
  let IPAddress
  let fileBatchID

  beforeEach(async () => {
    user = await getUser()
    IPAddress = uuidv4()
    fileBatchID = uuidv4()
    await uploadCSVFiles(user._id, fileBatchID)
  })
  
  test('zip file created in GCP ', async () => {
    const zipWriter = new ZipWriter(user, IPAddress, fileBatchID)
    const results = await zipWriter.createZip()
    expect(JSON.stringify(results.manifest)).toBe(`[["${user._id}/downloads/${fileBatchID}/0.csv","${fileBatchID}/0.csv"],["${user._id}/downloads/${fileBatchID}/1.csv","${fileBatchID}/1.csv"]]`)
  })
  test('throws error during zip creation if incorrect fileBatchID supplied', async () => {
    const zipWriter = new ZipWriter(user, IPAddress, 'invalidID')
    await expect(zipWriter.createZip()).rejects.toThrow('Error creating zip file')
  })
  test('url created for zip file download', async () => {
    const zipWriter = new ZipWriter(user, IPAddress, fileBatchID)
    await expect(zipWriter.getURL()).resolves.toEqual(expect.stringContaining(`https://storage.googleapis.com/invoices6293_dev/${user._id}/downloads/${fileBatchID}/CSVFiles.zip`))
  })
})


