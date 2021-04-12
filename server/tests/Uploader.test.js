const express = require('express')
const app = express()
const request = require('supertest')
const connectDB = require('../loaders/db')
const { v4: uuidv4 } = require('uuid')
const fsPromises = require('fs').promises
const {Storage} = require('@google-cloud/storage')
const storage = new Storage()
const bucket = storage.bucket(process.env.STORAGE_BUCKET)
const Uploader = require('../services/Uploader')
const User = require('../models/user')
const multer = require('multer')
const localUpload = multer({ storage: multer.memoryStorage() }).fields([{ name: 'valid' }, { name: 'invalid' }])



let dbConnection
const reqFiles = {}


const getUser = async () => {
  const username = uuidv4()
  const email = uuidv4() + '@test.com'
  const password =  'testPassword' + uuidv4()
  const user = new User({ username, email, password })
  await user.save()
  return user
}


const getReqFiles = async () => {
  const validFiles = await fsPromises.readdir(__dirname + '/seeds/uploads/cloud/validExts')
  const invalidFiles = await fsPromises.readdir(__dirname + '/seeds/uploads/cloud/invalidExts')
  let requestInstance = request(app).post('/files')
  for (const fileName of validFiles) {
    requestInstance.attach('valid', __dirname + `/seeds/uploads/cloud/validExts/${fileName}`)
  }
  for (const fileName of invalidFiles) {
    requestInstance.attach('invalid', __dirname + `/seeds/uploads/cloud/invalidExts/${fileName}`)
  }
  await requestInstance
}


app.post('/files', localUpload, async (req, res) => {
  reqFiles.valid = req.files.valid
  reqFiles.invalid = req.files.invalid
  return res.end()
})


beforeAll(async () => {
  dbConnection = await connectDB()
  await getReqFiles()
})


afterAll(async () => {
  await bucket.deleteFiles()
  await dbConnection.close()
  console.log('Database connection closed')
})


describe('instantiating Uploader', () => {
  test('initializes constructor', async () => {
    const user = await getUser()
    const uploader = new Uploader(user, uuidv4(), uuidv4(), reqFiles.valid)
    expect(uploader.user).toBeTruthy()
    expect(uploader.IPAddress).toBeTruthy()
    expect(uploader.fileBatchID).toBeTruthy()
    expect(uploader.files).toBeTruthy()
  })
})


describe('validating file formats', () => {
  test('accepts valid formats', async () => {
    const user = await getUser()
    const uploader = new Uploader(user, uuidv4(), uuidv4(), reqFiles.valid)
    await expect(uploader.checkFileFormats()).resolves.not.toThrow()
  })
  test('rejects invalid formats', async () => {
    const user = await getUser()
    const uploader = new Uploader(user, uuidv4(), uuidv4(), reqFiles.invalid)
    await expect(uploader.checkFileFormats()).rejects.toThrow('File format not supported. Accepted file formats: pdf, gif, tif')
  })
})


describe('uploading files to GCP', () => {
  test('streams buffers to storage bucket', async () => {
    const user = await getUser()
    const uploader = new Uploader(user, uuidv4(), uuidv4(), reqFiles.valid)
    const filesAreInCloud = (files) => {
      return Promise.all(files.map(async file => {
        const cloudFile = bucket.file(`${uploader.user._id}/uploads/${uploader.fileBatchID}/${file.originalname}`)
        const exists = await cloudFile.exists()
        return exists[0] 
      }))
      .then(result => {
        return (result.includes(false) ? false : true)
      })
    }
    await expect(uploader.uploadToCloud()).resolves.not.toThrow()
    await expect(filesAreInCloud(reqFiles.valid)).resolves.toBe(true)
  })
})



