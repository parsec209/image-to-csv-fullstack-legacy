const fsPromises = require('fs').promises
const {Storage} = require('@google-cloud/storage')
const storage = new Storage()
const bucket = storage.bucket(process.env.STORAGE_BUCKET)
const { v4: uuidv4 } = require('uuid')
const { identifyDocText, compileData } = require('../services/CSVGenerator')
const connectDB = require('../loaders/db')
const mongoose = require('mongoose')
const Doc = require('../models/doc')
const User = require('../models/user')
const PostService = require('../services/postService')
const postService = new PostService(Doc)



let dbConnection


const getUser = async () => {
  const user = new User({ username: uuidv4(), email: `${uuidv4()}@test.com`, password: 'testPassword1234' })
  await user.save()
  return user
}


const getRecurringDocs = async (userID) => {
  const recurringDocsSeed = await fsPromises.readFile(__dirname + '/seeds/database/docs.json')
  await Promise.all(JSON.parse(recurringDocsSeed).map(async recurringDoc => {
    if (recurringDoc.name !== 'TIF.tif') {
      await postService.post({ ...recurringDoc, user: { id: userID }})
    }
  }))
  return await postService.findAll({ 'user.id': userID })
}


const getDocsText = async () => {
  const docTextFileTIFF = await fsPromises.readFile(__dirname + '/seeds/extractedText/TIFF.json')
  const docTextFileGIF = await fsPromises.readFile(__dirname + '/seeds/extractedText/GIF.json')
  return [JSON.parse(docTextFileTIFF), JSON.parse(docTextFileGIF)]
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


describe('identifying doc text using recurringDoc ID phrase', () => {

  let recurringDocs
  let docsText

  const initCSVGenerator = async () => { 
    const user = await getUser()
    return new CSVGenerator(user, uuidv4(), [1], '2020/01/20')
  }

  beforeAll(async () => {
    recurringDocs = await getRecurringDocs(new mongoose.Types.ObjectId())
    docsText = await getDocsText()
  })

  afterAll(async () => {
    await dbConnection.dropCollection('docs')
  })

  test('populates only the "unmatchedDocsText" array if docText exists but db contains no recurringDoc phrases', async () => {
    const received = identifyDocText([docsText[0]], [])
    const expected = {'matchedDocsText': [], 'matchedRecurringDocs': [], 'unmatchedDocsText': ['TIFF.tiff']}
    expect(JSON.stringify(Object.entries(received).sort())).toBe(JSON.stringify(Object.entries(expected).sort()))
  })
  test('populates only the "unmatchedDocsText" array if docText exists but there are no matching recurringDoc phrases in db', async () => {
    const received = identifyDocText([docsText[0]], recurringDocs)
    const expected = {'matchedDocsText': [], 'matchedRecurringDocs': [], 'unmatchedDocsText': ['TIFF.tiff']}
    expect(JSON.stringify(Object.entries(received).sort())).toBe(JSON.stringify(Object.entries(expected).sort()))
  })
  test('populates "matchedDocsText," "unmatchedDocsText," and "matchedRecurringDocs" if there are both matching and unmatching docs to a recurringDoc phrase', async () => {
    const recurringDoc = recurringDocs.find(recurringDoc => recurringDoc.name === 'GIF.GIF')
    const received = identifyDocText(docsText, recurringDocs)
    const expected = {'matchedDocsText': ['GIF.GIF'], 'matchedRecurringDocs': [{ fileName: 'GIF.GIF', recurringDoc }], 'unmatchedDocsText': ['TIFF.tiff']}
    expect(JSON.stringify(Object.entries(received).sort())).toBe(JSON.stringify(Object.entries(expected).sort()))
  })
  test('none of the three arrays populated if docsText is empty', async () => {
    const received = identifyDocText([], recurringDocs)
    const expected = {'matchedDocsText': [], 'matchedRecurringDocs': [], 'unmatchedDocsText': []}
    expect(JSON.stringify(Object.entries(received).sort())).toBe(JSON.stringify(Object.entries(expected).sort()))
  })
})
 

describe('generating data from uploads, starting with text extraction and ending with written CSV files', () => {

  const filesAreInCloud = (files, fileBatchID, userID) => {
    return Promise.all(files.map(async (file, index) => {
      const cloudFile = bucket.file(`${userID}/downloads/${fileBatchID}/${index}.csv`)
      const exists = await cloudFile.exists()
      return exists[0] 
    }))
    .then(result => {
      return (result.includes(false) ? false : true)
    })
  }

  afterEach(async () => {
    await dbConnection.dropCollection('docs')
  })

  test('returns expected status when one doc text does not match any recurringDoc and another doc contains no text', async () => {
    const user = await getUser()
    const userID = user._id
    await getRecurringDocs(userID)
    const fileBatchID = uuidv4()
    const options1 = {
      destination: `${userID}/uploads/${fileBatchID}/blankFile.tiff`,
      metadata: {
        contentType: 'image/tiff'
      }
    }
    const options2 = {
      destination: `${userID}/uploads/${fileBatchID}/TIF.tif`,
      metadata: {
        contentType: 'image/tiff'
      }
    }
    await bucket.upload(__dirname + '/seeds/uploads/cloud/validExts/blankFile.tiff', options1)
    await bucket.upload(__dirname + '/seeds/uploads/cloud/validExts/TIF.tif', options2)
    const successStatus = await compileData(user, fileBatchID, [1], '2020/01/20')
    const expected = {
      identifiedDocs: [],
      unidentifiedDocs: ['blankFile.tiff', 'TIF.tif']
    }
    expect(JSON.stringify(successStatus.identifiedDocs.sort())).toBe(JSON.stringify(expected.identifiedDocs.sort()))
    expect(JSON.stringify(successStatus.unidentifiedDocs.sort())).toBe(JSON.stringify(expected.unidentifiedDocs.sort()))
    await expect(filesAreInCloud([0], fileBatchID, userID)).resolves.toBe(false)
  })
  test('returns expected status when there are uploads that match existing recurringDocs and others that do not', async () => {
    const user = await getUser()
    const userID = user._id
    await getRecurringDocs(userID)
    const fileBatchID = uuidv4()
    const options1 = {
      destination: `${userID}/uploads/${fileBatchID}/PDF_editable.pdf`,
      metadata: {
        contentType: 'application/pdf'
      }
    }
    const options2 = {
      destination: `${userID}/uploads/${fileBatchID}/TIF.tif`,
      metadata: {
        contentType: 'image/tiff'
      }
    }
    const options3 = {
      destination: `${userID}/uploads/${fileBatchID}/GIF.GIF`,
      metadata: {
        contentType: 'image/gif'
      }
    }
    await bucket.upload(__dirname + '/seeds/uploads/cloud/validExts/PDF_editable.pdf', options1)
    await bucket.upload(__dirname + '/seeds/uploads/cloud/validExts/TIF.tif', options2)
    await bucket.upload(__dirname + '/seeds/uploads/cloud/validExts/GIF.GIF', options3)
    const successStatus = await compileData(user, fileBatchID, [1, 2, 3], '2020/01/20')
    const expected = {
      identifiedDocs: ['PDF_editable.pdf', 'GIF.GIF'],
      unidentifiedDocs: ['TIF.tif']
    }
    expect(JSON.stringify(successStatus.identifiedDocs.sort())).toBe(JSON.stringify(expected.identifiedDocs.sort()))
    expect(JSON.stringify(successStatus.unidentifiedDocs.sort())).toBe(JSON.stringify(expected.unidentifiedDocs.sort()))
    await expect(filesAreInCloud([0, 1], fileBatchID, userID)).resolves.toBe(true)
  })
  test('returns expected status when incorrect fileBatchID is supplied (no doc text will be retrieved)', async () => {
    const user = await getUser()
    const userID = user._id
    await getRecurringDocs(userID)
    const fileBatchID = uuidv4()
    const successStatus = await compileData(user, fileBatchID, [1, 2, 3], '2020/01/20')
    const expected = {
      identifiedDocs: [],
      unidentifiedDocs: []
    }
    expect(JSON.stringify(successStatus.identifiedDocs.sort())).toBe(JSON.stringify(expected.identifiedDocs.sort()))
    expect(JSON.stringify(successStatus.unidentifiedDocs.sort())).toBe(JSON.stringify(expected.unidentifiedDocs.sort()))
    await expect(filesAreInCloud([0], fileBatchID, userID)).resolves.toBe(false)
  })
})



   






