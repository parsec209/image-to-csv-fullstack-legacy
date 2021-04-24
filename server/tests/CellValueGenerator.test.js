const fsPromises = require('fs').promises
const CellValueGenerator = require('../services/CellValueGenerator')
const PostService = require('../services/PostService')
const Doc = require('../models/doc')
const User = require('../models/user')
const connectDB = require('../loaders/db')


let dbConnection
let userID
let recurringDocs
let recurringDocGIF
let recurringDocPDF
let recurringDocPDFCellValues
let docTextGIF
let docTextPDF
let docTextLinesGIF
let docTextLinesPDF


const getUserID = async () => {
  const userSeed = await fsPromises.readFile(__dirname + '/seeds/database/users.json')
  const user = new User(JSON.parse(userSeed))
  await user.save()
  return user._id
}


const getRecurringDocs = async () => {
  const recurringDocsSeed = await fsPromises.readFile(__dirname + '/seeds/database/docs.json')
  return JSON.parse(recurringDocsSeed)
}


const getRecurringDoc = async (userID, recurringDocs, recurringDocIndex) => {
  const postService = new PostService(Doc)
  return await postService.post({ ...recurringDocs[recurringDocIndex], user: { id: userID }})
}


const getDocText = async (fileName) => {
  const docTextFile = await fsPromises.readFile(__dirname + `/seeds/textLines/docText/${fileName}`)
  return JSON.parse(docTextFile)
}


const getDocTextLines = async (fileName) => {
  const docTextLinesFile = await fsPromises.readFile(__dirname + `/seeds/textLines/sorted/${fileName}`)
  return JSON.parse(docTextLinesFile)
}


beforeAll(async () => {
  dbConnection = await connectDB()
  userID = await getUserID() 
  recurringDocs = await getRecurringDocs() 
  recurringDocGIF = await getRecurringDoc(userID, recurringDocs, 0) 
  recurringDocPDF = await getRecurringDoc(userID, recurringDocs, 1) 
  recurringDocPDFCellValues = await getRecurringDoc(userID, recurringDocs, 2) 
  docTextGIF = await getDocText('GIF.json') 
  docTextPDF= await getDocText('PDF_editable.json') 
  docTextLinesGIF = await getDocTextLines('GIF.json')
  docTextLinesPDF = await getDocTextLines('PDF_editable.json')
})
 

afterAll(async () => {
  await dbConnection.dropDatabase()
  await dbConnection.close()
  console.log('Database connection closed')
})


describe('instantiating CellValueGenerator', function() {
  test('initializes constructor', () => {
    const cellValueGenerator = new CellValueGenerator(docTextPDF, docTextLinesPDF, recurringDocPDF, '2020/09/01')
    expect(cellValueGenerator.docText).toBeTruthy()
    expect(cellValueGenerator.docTextLines).toBeTruthy()
    expect(cellValueGenerator.recurringDoc).toBeTruthy()
    expect(cellValueGenerator.dateToday).toBeTruthy()
  })
})


describe('formatting dates', () => {

  const initCellValueGenerator = () => {
    return new CellValueGenerator(docTextPDF, docTextLinesPDF, recurringDocPDFCellValues, '2020/09/01')
  }

  test('outputs specified date format, with days added', () => {
    const formattedDate = initCellValueGenerator().getFormattedDate('2014-08-02', recurringDocPDFCellValues.dataRows[0].dataCells[0].cellSects[0])
    expect(formattedDate).toBe('08/12/2014')
  })
  test('outputs specified date format with year input omitted, with days added', () => {
    const formattedDate = initCellValueGenerator().getFormattedDate('8/14', recurringDocPDFCellValues.dataRows[0].dataCells[0].cellSects[1])
    expect(formattedDate).toBe('08-24-2001')
  })
  test('outputs specified date format with day input omitted, with days added', () => {
    const formattedDate = initCellValueGenerator().getFormattedDate('August 2005', recurringDocPDFCellValues.dataRows[0].dataCells[0].cellSects[2])
    expect(formattedDate).toBe('05-08-11')
  })
  test('outputs specified date format with any combo or quantity of the seven characters between these brackets: [MDY ,-/], with days added', () => {
    const formattedDate = initCellValueGenerator().getFormattedDate('07-10-2016', recurringDocPDFCellValues.dataRows[0].dataCells[0].cellSects[3])
    expect(formattedDate).toBe('2016 16 162016, 2016, 02016-20-20-202-202-20220/7/07/Jul/July/July7')
  })
  test('returns empty string if input is not recognized as date, with days added', () => {
    const formattedDate = initCellValueGenerator().getFormattedDate('testDate', recurringDocPDFCellValues.dataRows[0].dataCells[1].cellSects[0])
    expect(formattedDate).toBe('')
  })
})


describe('parsing doc text with regular expressions', () => {

  const initCellValueGenerator = () => {
    return new CellValueGenerator(docTextPDF, docTextLinesPDF, recurringDocPDFCellValues, '2020/09/01')
  }

  test('finds string using regex', () => {
    const textFound = initCellValueGenerator().getCellSectValueFromPattern(recurringDocPDFCellValues.dataRows[0].dataCells[1].cellSects[1])
    //found in page 1 of pdf
    expect(textFound).toBe('Submitted on 01/01/2000')
  })
  test('returns empty string if regex finds nothing', () => {
    const textFound = initCellValueGenerator().getCellSectValueFromPattern(recurringDocPDFCellValues.dataRows[0].dataCells[1].cellSects[2])
    expect(textFound).toBe('')
  })
})


describe('parsing doc text using anchor phrases', () => {

  const initCellValueGenerator = () => {
    return new CellValueGenerator(docTextPDF, docTextLinesPDF, recurringDocPDFCellValues, '2020/09/01')
  }

  describe('parsing doc text using left key phrase', () => {
    test('gets desired text when it exists in the same line as the left key phrase', () => {      
      const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[1].cellSects[3]) 
      //found in page 1 of pdf
      expect(textFound).toBe(' Your Street')
    })
    test('gets desired text when it exists in the line after the left key phrase', () => {       
      const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[2].cellSects[0]) 
      //page 1 of pdf
      expect(textFound).toBe('-$100.00')
    })
    test('gets desired text when it is followed by one or more lines to its right', () => {  
      const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[2].cellSects[1]) 
      //page 1 of pdf      
      expect(textFound).toBe('Unit price')
    })
    test('returns empty string when key phrase not found', () => {     
      const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[2].cellSects[2]) 
      expect(textFound).toBe('')
    })
    test('gets desired text using the first left key phrase found (key phrase exists more than once on same page)', () => {
      const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[2].cellSects[3]) 
      //page 1 of pdf
      expect(textFound).toBe(' #1')
    })
    test('gets desired text using the first left key phrase found (key phrase exists more than once in different pages of the doc)', () => {
      const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[3].cellSects[0]) 
      //page 1 and 2 of pdf, page 2 showing "Notes" to the right of "Description"
      expect(textFound).toBe('Qty')
    })
    test('gets desired text using multiple phrase counts, first phrase being part of same line as anchor phrase', () => {
      const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[8].cellSects[0]) 
      //page 1 of pdf
      expect(textFound).toBe('Due date')
    })
    test('gets desired text on different page from anchor phrase, using multiple phrase counts, and first phrase being part of same line as anchor phrase', () => {
      const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[8].cellSects[1]) 
      //page 2 of pdf contains target phrase
      expect(textFound).toBe('Your Company')
    })
    test('gets desired text using multiple phrase counts, first phrase not being part of same line as anchor phrase', () => {
      const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[8].cellSects[2]) 
      //page 1 of pdf
      expect(textFound).toBe('Invoice #')
    })
    test('gets desired text on different page from anchor phrase, using multiple phrase counts, and first phrase not being part of same line as anchor phrase', () => {
      const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[8].cellSects[3]) 
      //page 2 of pdf contains target phrase
      expect(textFound).toBe('Expense Report')
    })
    test('returns empty string when phrase count exceeds phrases in doc', () => {
      const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[9].cellSects[0]) 
      //page 2 of pdf
      expect(textFound).toBe('')
    })
  })

  describe('parsing text using top key phrase', () => {
    test('gets desired text, when top key phrase is followed by additional text in the same line', () => {   
      const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[3].cellSects[1]) 
      //page 1 of pdf
      expect(textFound).toBe('Your City, ST 12345')
    })
    test('gets desired text, when top key phrase is not followed by additional text in the same line', () => {
      const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[3].cellSects[2]) 
      //page 2 of pdf
      expect(textFound).toBe('09/04/00 - 09/05/00')
    })
    test('gets desired text, when there are one or more lines to the right of the top key phrase', () => {
      const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[3].cellSects[3]) 
      //page 2 of pdf
      expect(textFound).toBe('Manager')
    })
    test('gets desired text using the first top key phrase found (key phrase exists more than once on same page)', () => {
      const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[4].cellSects[0]) 
      //page 2 of pdf
      expect(textFound).toBe('9/4')
    })
    test('gets desired text using the first top key phrase found (key phrase exists more than once in different pages of the doc)', () => {
      const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[4].cellSects[1]) 
      //page 1 & 2 of pdf, page 2 showing "Expense Report" below the top phrase
      expect(textFound).toBe('Invoice')
    })
    test('gets desired text when it is followed by one or more lines to its right', () => {
      const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[4].cellSects[2]) 
      //page 2 of pdf
      expect(textFound).toBe('Flight')
    })
    test('returns empty string when key phrase not found', () => {     
      const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[4].cellSects[3]) 
      expect(textFound).toBe('')
    })
    test('gets desired text using multiple phrase counts, anchor phrase being just part of a line\'s text', () => {
      const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[9].cellSects[1]) 
      //page 1 of pdf
      expect(textFound).toBe('Notes:')
    })
    test('gets empty string (does not parse next page) when using multiple phrase counts, when anchor is just part of a line\'s text, and does not share x-coordinate with target phrase', () => {
      const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[9].cellSects[2]) 
      //page 1 of pdf
      expect(textFound).toBe('')
    })
    test('gets desired text using multiple phrase counts, anchor phrase being the entire line\'s text', () => {
      const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[9].cellSects[3]) 
      //page 1 of pdf
      expect(textFound).toBe('Adjustments')
    })
  })
})

  
describe('getting cell values', () => {

  const initCellValueGenerator = () => {
    return new CellValueGenerator(docTextPDF, docTextLinesPDF, recurringDocPDFCellValues, '2020/09/01')
  }
  
  test('gets cell value using regex, phrase positions, and customValue methods for the four cell sects; appendChars and date formatting also included', () => {    
    const cellValue = initCellValueGenerator().getCellValue(recurringDocPDFCellValues.dataRows[0].dataCells[5])
    expect(cellValue).toBe('Your Company---238HR03-Jan-2000$0.00  / @ test value')
  })
  test('gets cell value using today\'s date as the input method', () => {
    const cellValue = initCellValueGenerator().getCellValue(recurringDocPDFCellValues.dataRows[0].dataCells[6])
    expect(cellValue).toBe('2020/09/01')
  })
  test('gets empty string if recurringDoc cell has only one sect with empty searchOrInputMethod', () => {
    const cellValue = initCellValueGenerator().getCellValue(recurringDocPDFCellValues.dataRows[0].dataCells[7])
    expect(cellValue).toBe('')
  })
})


describe('generating a CSV blueprint', () => {
  test('gets blueprint (GIF from recurringDocs)',  async () => {
    const cellValueGenerator = new CellValueGenerator(docTextGIF, docTextLinesGIF, recurringDocGIF, '2020/09/01')
    const expected = {
      fileName: 'GIF.GIF',
      CSVHeader: [
        { id: '0', title: 'Date' },
        { id: '1', title: 'Description' }
      ],
      CSVDataRows: [
        { 0: '01-Sep-20', 1: 'Service Fee' }
      ]
    }
    const actual = cellValueGenerator.getCSVBlueprint()
    expect(JSON.stringify(actual)).toBe(JSON.stringify(expected))
  })
  test('gets blueprint (PDF_editable from recurringDocs)', async () => {
    const cellValueGenerator = new CellValueGenerator(docTextPDF, docTextLinesPDF, recurringDocPDF, '2020/09/01')
    const expected = {
      fileName: 'PDF_editable.pdf',
      CSVHeader: [
        {id: '0', title: 'Invoice #'},
        {id: '1', title: 'Custom Value'}
      ],
      CSVDataRows: [
        { 0: '123456', 1: 'test123' },
        { 0: '', 1: 'test 456' }
      ]
    }
    const actual = cellValueGenerator.getCSVBlueprint()
    expect(JSON.stringify(actual)).toBe(JSON.stringify(expected))
  })
})






