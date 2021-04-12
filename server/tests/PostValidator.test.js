const fsPromises = require('fs').promises
const PostService = require('../services/PostService')
const connectDB = require('../loaders/db')
const Doc = require('../models/doc')
const Header = require('../models/header')
const User = require('../models/user')



let dbConnection
let userID
 

const getUserID = async () => {
  const userSeed = await fsPromises.readFile(__dirname + '/seeds/database/users.json')
  const users = await User.create([JSON.parse(userSeed)])
  return users[0]._id
}


beforeAll(async () => {
  dbConnection = await connectDB()
  userID = await getUserID()
})


afterAll(async () => {
  await dbConnection.dropCollection('users')
  await dbConnection.dropCollection('docs')
  await dbConnection.dropCollection('headers')
  await dbConnection.close()
  console.log('Database connection closed')
})


describe('validating header posts', () => {
  test('rejects if two or more header cell values are identical', async () => {
    const props = {
      name: 'testHeader',
      cells: [
        { value: 'headerCell' },
        { value: 'headerCell' }
      ],
      user: { id: userID }
    }
    await expect(new PostService(Header).post(props)).rejects.toThrow(new Error('Header validation failed: cells: Duplicate header cell values not allowed'))
  })
  test('rejects if length of header cells is less than one', async () => {
    const props = {
      name: 'testHeader',
      cells: [],
      user: { id: userID }
    }    
    await expect(new PostService(Header).post(props)).rejects.toThrow(new Error('Header validation failed: cells: Must have between one and 52 header cells'))
  }) 
  test('rejects if length of header cells is greater than 52', async () => {
    const generateProps = () => {
      const cells = []
      for (let i = 0; i < 53; i++) {
        cells.push({ value: `headerCell${i}` })
      }
      const props = {
        name: 'testHeader',
        cells,
        user: { id: userID }
      }
      return props
    }    
    await expect(new PostService(Header).post(generateProps())).rejects.toThrow(new Error('Header validation failed: cells: Must have between one and 52 header cells'))
  }) 
})


describe('validating cellSect posts', () => {
  test('rejects if there is no "phraseOrValue" when the "searchOrInputMethod" is one of the following: "topPhrase", "leftPhrase", "pattern", "customValue"', async () => {
    const props = {
      name: 'docName',
      idPhrase: 'docPhrase',
      header: [{ value: 'headercell' }],
      dataRows: [
        { dataCells: [ 
          { cellSects: [
            {
              searchOrInputMethod: 'customValue'
            }
          ]}
        ]}
      ],
      user: { id: userID }
    }    
    await expect(new PostService(Doc).post(props)).rejects.toThrow(new Error('Doc validation failed: dataRows.0.dataCells.0.cellSects.0.phraseOrValue: Path `phraseOrValue` is required.'))
  })
  test('rejects if there is no "searchOrInputMethod" when there is a "phraseOrValue"', async () => {
    const props = {
      name: 'docName',
      idPhrase: 'docPhrase',
      header: [{ value: 'headercell' }],
      dataRows: [
        { dataCells: [ 
          { cellSects: [
            {
              phraseOrValue: 'sectPhrase'
            }
          ]}
        ]}
      ],
      user: { id: userID }
    }    
    await expect(new PostService(Doc).post(props)).rejects.toThrow(new Error('Doc validation failed: dataRows.0.dataCells.0.cellSects.0.phraseOrValue: SearchOrInputMethod must be defined'))
  })
  test('rejects if there is a "phraseOrValue" when the "searchOrInputMethod" is "today"', async () => {
    const props = {
      name: 'docName',
      idPhrase: 'docPhrase',
      header: [{ value: 'headercell' }],
      dataRows: [
        { dataCells: [ 
          { cellSects: [
            {
              searchOrInputMethod: 'today',
              phraseOrValue: 'sectPhrase'
            }
          ]}
        ]}
      ],
      user: { id: userID }
    }    
    await expect(new PostService(Doc).post(props)).rejects.toThrow(new Error('Doc validation failed: dataRows.0.dataCells.0.cellSects.0.phraseOrValue: SearchOrInputMethod cannot be "today"'))
  })
  test('rejects if there is an "appendChars" when there is no "searchOrInputMethod"', async () => {
    const props = {
      name: 'docName',
      idPhrase: 'docPhrase',
      header: [{ value: 'headercell' }],
      dataRows: [
        { dataCells: [ 
          { cellSects: [
            {
              appendChars: '--'
            }
          ]}
        ]}
      ],
      user: { id: userID }
    }    
    await expect(new PostService(Doc).post(props)).rejects.toThrow(new Error('Doc validation failed: dataRows.0.dataCells.0.cellSects.0.appendChars: SearchOrInputMethod must be defined'))
  })
  test('rejects if there is a "dateFormat" when there is no "searchOrInputMethod"', async () => {
    const props = {
      name: 'docName',
      idPhrase: 'docPhrase',
      header: [{ value: 'headercell' }],
      dataRows: [
        { dataCells: [ 
          { cellSects: [
            {
              dateFormat: 'MMDDYY'
            }
          ]}
        ]}
      ],
      user: { id: userID }
    }    
    await expect(new PostService(Doc).post(props)).rejects.toThrow(new Error('Doc validation failed: dataRows.0.dataCells.0.cellSects.0.dateFormat: SearchOrInputMethod must be defined'))
  })
  test('rejects if there is a "dateFormat" containing characters other than the following: "Y", "M", "D", " ", "/", "-"', async () => {
    const props = {
      name: 'docName',
      idPhrase: 'docPhrase',
      header: [{ value: 'headercell' }],
      dataRows: [
        { dataCells: [ 
          { cellSects: [
            {
              searchOrInputMethod: 'today',
              dateFormat: 'MM}}DDYY'
            }
          ]}
        ]}
      ],
      user: { id: userID }
    }    
    await expect(new PostService(Doc).post(props)).rejects.toThrow(new Error('Doc validation failed: dataRows.0.dataCells.0.cellSects.0.dateFormat: Date format can only contain the following characters:  "Y", "M", "D", " ", "/", "-", ","'))
  })
  test('rejects if "daysAdded" is not an integer', async () => {
    const props = {
      name: 'docName',
      idPhrase: 'docPhrase',
      header: [{ value: 'headercell' }],
      dataRows: [
        { dataCells: [ 
          { cellSects: [
            {
              searchOrInputMethod: 'today',
              dateFormat: 'MM/DD/YY',
              daysAdded: 2.5
            }
          ]}
        ]}
      ],
      user: { id: userID }
    }    
    await expect(new PostService(Doc).post(props)).rejects.toThrow(new Error('Doc validation failed: dataRows.0.dataCells.0.cellSects.0.daysAdded: Added days must be an integer'))
  })
})


describe('validating dataCell posts', () => {
  test('rejects if a data cell has less than one cell section', async () => {
    const props = {
      name: 'docName',
      idPhrase: 'docPhrase',
      header: [{ value: 'headercell' }],
      dataRows: [
        { dataCells: [ 
          { cellSects: 
            []
          }
        ]}
      ],
      user: { id: userID }
    }    
    await expect(new PostService(Doc).post(props)).rejects.toThrow(new Error('Doc validation failed: dataRows.0.dataCells.0.cellSects: Must have between one and four cell sections per data cell'))
  })
  test('rejects if a data cell has more than four cell sections', async () => {
    const props = {
      name: 'docName',
      idPhrase: 'docPhrase',
      header: [{ value: 'headercell' }],
      dataRows: [
        { dataCells: [ 
          { cellSects: [
            { searchOrInputMethod: 'customValue', phraseOrValue: 'sectPhrase' },
            { searchOrInputMethod: 'customValue', phraseOrValue: 'sectPhrase' },
            { searchOrInputMethod: 'customValue', phraseOrValue: 'sectPhrase' },
            { searchOrInputMethod: 'customValue', phraseOrValue: 'sectPhrase' },     
            { searchOrInputMethod: 'customValue', phraseOrValue: 'sectPhrase' }     
          ]}
        ]}
      ],
      user: { id: userID }
    }    
    await expect(new PostService(Doc).post(props)).rejects.toThrow(new Error('Doc validation failed: dataRows.0.dataCells.0.cellSects: Must have between one and four cell sections per data cell'))
  })
})


describe('validating dataRow posts', () => {
  test('rejects if the number of cells in a row does not match the number of cells in the header', async () => {
    const props = {
      name: 'docName',
      idPhrase: 'docPhrase',
      header: [
        { value: 'headercell1' },
        { value: 'headercell2' },
        { value: 'headercell3' }
      ],
      dataRows: [
        { dataCells: [ 
          { cellSects: [{}] },
          { cellSects: [{}] }
        ]}
      ],
      user: { id: userID }
    }    
    await expect(new PostService(Doc).post(props)).rejects.toThrow(new Error('Doc validation failed: dataRows: Number of cells in a data row must equal that of the header'))
  })
})


describe('validating doc posts', () => {
  test('rejects if a doc has less than one data row', async () => {
    const props = {
      name: 'docName',
      idPhrase: 'docPhrase',
      header: [{ value: 'headercell' }],
      dataRows: [],
      user: { id: userID }
    }    
    await expect(new PostService(Doc).post(props)).rejects.toThrow(new Error('Doc validation failed: dataRows: Must have between one and 100 data rows'))
  })
  test('rejects if a doc has more than 100 data rows', async () => {
    const generateProps = () => {
      const dataRows = []
      for (let i = 0; i < 101; i++) {
        dataRows.push({ dataCells: [{ cellSects: [{}] }] })
      }
      const props = {
        name: 'docName',
        idPhrase: 'docPhrase',
        header: [{ value: 'headercell' }],
        dataRows,
        user: { id: userID }
      }
      return props
    }    
    await expect(new PostService(Doc).post(generateProps())).rejects.toThrow(new Error('Doc validation failed: dataRows: Must have between one and 100 data rows'))
  })
})








