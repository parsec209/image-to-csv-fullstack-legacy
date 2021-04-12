const fsPromises = require('fs').promises
const PostService = require('../services/PostService')
const connectDB = require('../loaders/db')
const Doc = require('../models/doc')
const Header = require('../models/header')
const User = require('../models/user')



let dbConnection
let userID
let headerID
let docID


const getUserID = async () => {
  const userSeed = await fsPromises.readFile(__dirname + '/seeds/database/users.json')
  const users = await User.create([JSON.parse(userSeed)])
  return users[0]._id
}


const getHeaderID = async () => {
  const headerSeed = await fsPromises.readFile(__dirname + '/seeds/database/headers.json')
  const headers = await Header.create([{ ...JSON.parse(headerSeed), user: { id: userID }}])
  return headers[0]._id
}


const getDocID = async () => {
  const docSeed = await fsPromises.readFile(__dirname + '/seeds/database/docs.json')
  const docs = await Doc.create([{ ...JSON.parse(docSeed)[0], user: { id: userID }}])
  return docs[0]._id
}


beforeAll(async () => {
  dbConnection = await connectDB()
  userID = await getUserID()
})


beforeEach(async () => {
  headerID = await getHeaderID()
  docID = await getDocID()
})


afterEach(async () => {
  await dbConnection.dropCollection('docs')
  await dbConnection.dropCollection('headers')
})


afterAll(async () => {
  await dbConnection.dropCollection('users')
  await dbConnection.close()
  console.log('Database connection closed')
})


describe('instantiating PostService', () => {
  test('initializes constructor', () => {
    const postService = new PostService(Doc)
    expect(postService.model).toBeTruthy()
  })
})


describe('retrieving documents', () => {
  test('gets headers with a given user ID', async () => {
    const postService = new PostService(Header)
    const headers = await postService.findAll({ 'user.id': userID })
    expect(headers).toHaveLength(1)
    expect(headers[0]).toHaveProperty('name')
    expect(headers[0]).toHaveProperty('cells')
  })
  test('gets docs with a given user ID', async () => {
    const postService = new PostService(Doc)
    const docs = await postService.findAll({ 'user.id': userID })
    expect(docs).toHaveLength(1)
    expect(docs[0]).toHaveProperty('idPhrase')
    expect(docs[0]).toHaveProperty('dataRows')
  })
})


describe('retrieving a document', () => {
  test('gets header with a given user ID', async () => {
    const postService = new PostService(Header)
    const header = await postService.find(headerID.toHexString())
    expect(header).toHaveProperty('name')
    expect(header).toHaveProperty('cells')
  })
  test('gets doc with a given user ID', async () => {
    const postService = new PostService(Doc)
    const doc = await postService.find(docID.toHexString())
    expect(doc).toHaveProperty('idPhrase')
    expect(doc).toHaveProperty('dataRows')
  })
})


describe('updating a document', () => {
  test('updates header with a given user ID', async () => {
    const postService = new PostService(Header)
    const header = await Header.findById(headerID)
    const props = {
      cells: [
        { value: 'updatedCell' },
      ]
    } 
    const updatedHeader = await postService.update(header, props)
    expect(updatedHeader.name).toBe('testHeader1')
    expect(updatedHeader.cells).toHaveLength(1)
    expect(updatedHeader.cells[0].value).toBe('updatedCell')
  })
  test('updates doc with a given user ID', async () => {
    const postService = new PostService(Doc)
    const doc = await Doc.findById(docID)
    const props = {
      name: 'GIF.GIF',
      idPhrase: 'updatedPhrase',
      header: [
        { value : 'updatedHeaderCell' },
      ],
      dataRows: [
        { dataCells: [ 
          { cellSects: [
            {
              searchOrInputMethod: 'customValue', 
              phraseOrValue : 'updatedValue'
            }
          ]},
        ]}
      ]
    }
    const updatedDoc = await postService.update(doc, props)
    expect(updatedDoc.name).toBe('GIF.GIF')
    expect(updatedDoc.idPhrase).toBe('updatedPhrase')
    expect(updatedDoc.header).toHaveLength(1)
    expect(updatedDoc.dataRows[0].dataCells[0].cellSects).toHaveLength(1)
  })
})


describe('deleting a document', () => {
  test('deletes header with a given user ID', async () => {
    const postService = new PostService(Header)
    let header = await Header.findById(headerID)
    await postService.destroy(header)
    header = await Header.findById(headerID)
    expect(header).toBeNull()
  })
  test('deletes doc with a given user ID', async () => {
    const postService = new PostService(Doc)
    let doc = await Doc.findById(docID)
    await postService.destroy(doc)
    doc = await Doc.findById(docID)
    expect(doc).toBeNull()
  })
})


describe('posting a document', () => {
  test('posts new header', async () => {
    const postService = new PostService(Header)
    const props = {
      name: 'postedHeader',
      cells: [{ value: 'postedCell' }],
      user: { id: userID }
    }
    const newHeader = await postService.post(props)
    expect(newHeader.name).toBe('postedHeader')
    expect(newHeader.cells).toHaveLength(1)
    expect(newHeader.cells[0].value).toBe('postedCell')
  })
  test('posts new doc', async () => {
    const postService = new PostService(Doc)
    const props = {
      name: 'postDoc',
      idPhrase: 'postPhrase',
      header: [
        { value : 'postCell' },
      ],
      dataRows: [
        { dataCells: [ 
          { cellSects: [
            {}
          ]},
        ]}
      ],
      user: { id: userID }
    }
    const postedDoc = await postService.post(props)
    expect(postedDoc.name).toBe('postDoc')
    expect(postedDoc.idPhrase).toBe('postPhrase')
    expect(postedDoc.header).toHaveLength(1)
    expect(postedDoc.dataRows[0].dataCells[0].cellSects).toHaveLength(1)
  })
})



  
  

  
  