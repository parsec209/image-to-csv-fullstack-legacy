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
let recurringDocGIFCellValues
let docTextGIF
let docTextPDF
let wordListGIF
let wordListPDF


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


const getWordLists = async (fileName) => {
  const wordListFile = await fsPromises.readFile(__dirname + `/seeds/wordLists/sorted/${fileName}`)
  return JSON.parse(wordListFile)
}


beforeAll(async () => {
  dbConnection = await connectDB()
  userID = await getUserID() 
  recurringDocs = await getRecurringDocs() 
  recurringDocGIF = await getRecurringDoc(userID, recurringDocs, 0) 
  recurringDocPDF = await getRecurringDoc(userID, recurringDocs, 1) 
  recurringDocPDFCellValues = await getRecurringDoc(userID, recurringDocs, 2) 
  recurringDocGIFCellValues = await getRecurringDoc(userID, recurringDocs, 4) 
  docTextGIF = await getDocText('GIF.json') 
  docTextPDF = await getDocText('PDF_editable.json') 
  wordListGIF = await getWordLists('GIF.json')
  wordListPDF = await getWordLists('PDF_editable.json')
})
 

afterAll(async () => {
  await dbConnection.dropDatabase()
  await dbConnection.close()
  console.log('Database connection closed')
})


describe('instantiating CellValueGenerator', function() {
  test('initializes constructor', () => {
    const cellValueGenerator = new CellValueGenerator(docTextPDF, wordListPDF, recurringDocPDF, '2020/09/01')
    expect(cellValueGenerator.docText).toBeTruthy()
    expect(cellValueGenerator.wordList).toBeTruthy()
    expect(cellValueGenerator.recurringDoc).toBeTruthy()
    expect(cellValueGenerator.dateToday).toBeTruthy()
  })
})


describe('formatting dates', () => {

  const initCellValueGenerator = () => {
    return new CellValueGenerator(docTextPDF, wordListPDF, recurringDocPDFCellValues, '2020/09/01')
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
    return new CellValueGenerator(docTextPDF, wordListPDF, recurringDocPDFCellValues, '2020/09/01')
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


describe('finding the anchor phrase', () => {

  const initCellValueGenerator = () => {
    return new CellValueGenerator(docTextPDF, wordListPDF, recurringDocPDFCellValues, '2020/09/01')
  }

  test('returns phrase that meets specifications (single spaces, same line, same page) and starts with a  word that existed previously in doc', () => {
    const textFound = initCellValueGenerator().findAnchorPhrase('Your City, ST 12345')
    //found in page 1 of pdf
    expect(textFound).toStrictEqual({ 'pageIndex': 0, 'startWordIndex': 5, 'startSymbolIndex': 0, 'endWordIndex': 8, 'endSymbolIndex': 4 })
  })
  test('returns phrase that meets specifications (single spaces, same line, same page) and is embedded in another phrase on the second page of doc', () => {
    const textFound = initCellValueGenerator().findAnchorPhrase('04/00 - 09/')
    //found in page 2 of pdf
    expect(textFound).toStrictEqual({ 'pageIndex': 1, 'startWordIndex': 13, 'startSymbolIndex': 3, 'endWordIndex': 15, 'endSymbolIndex': 2 })
  })
  test('returns undefined if the phrase words found in the doc are further apart than a single space', () => {
    const textFound = initCellValueGenerator().findAnchorPhrase('Invoice for Payable to')
    //found in page 1 of pdf
    expect(textFound).toBeUndefined()
  })
  test('returns undefined if phrase not found', () => {
    const textFound = initCellValueGenerator().findAnchorPhrase('random phrase')
    expect(textFound).toBeUndefined()
  })
})


// describe('getting the anchor phrase coordinates', () => {

//   const initCellValueGenerator = () => {
//     return new CellValueGenerator(docTextGIF, wordListGIF, recurringDocGIF, '2020/09/01')
//   }

//   test('returns correct anchor phrase coords (with clear tallest char in phrase)', () => {
//     const textFound = initCellValueGenerator().getAnchorPhraseCoords({ pageIndex: 0, startWordIndex: 64, startSymbolIndex: 1, endWordIndex: 65, endSymbolIndex: 2 })
//     expect(textFound).toStrictEqual({ 'leftXCoord': 64, 'rightXCoord': 118, 'upperYCoord': 380, 'lowerYCoord': 396 })
//   })
//   test('returns correct anchor phrase coords (with clear lowest char in phrase)', () => {
//     const textFound = initCellValueGenerator().getAnchorPhraseCoords({ pageIndex: 0, startWordIndex: 17, startSymbolIndex: 0, endWordIndex: 20, endSymbolIndex: 7 })
//     expect(textFound).toStrictEqual({ 'leftXCoord': 104, 'rightXCoord': 194, 'upperYCoord': 118, 'lowerYCoord': 138 })
//   })
// })


// describe('detecting phrase breaks', () => {

//   const initCellValueGenerator = () => {
//     return new CellValueGenerator(docTextPDF, wordListPDF, recurringDocPDFCellValues, '2020/09/01')
//   }

//   test('evaluates phrase break as true', () => {
//     //Space between 'Unit price' and 'Total price' on page 1 of pdf
//     const isBreak = initCellValueGenerator().isPhraseBreak(wordListPDF['words'][0][40], wordListPDF['words'][0][41])
//     expect(isBreak).toBeTrue
//   })
//   test('evaluates phrase break as false', () => {
//     //Space between 'Unit' and 'price' on page 1 of pdf
//     const isBreak = initCellValueGenerator().isPhraseBreak(wordListPDF['words'][0][39], wordListPDF['words'][0][40])
//     expect(isBreak).toBeFalse
//   })
 
// })


// describe('determining if strings are on same line', () => {

//   const initCellValueGenerator = () => {
//     return new CellValueGenerator(docTextGIF, wordListGIF, recurringDocGIF, '2020/09/01')
//   }

//   test('evaluates strings as being on the same line, when they are clearly, visibly aligned', () => {
//     //'2034' and '21/02/2018' on gif
//     const areOnSameLine = initCellValueGenerator().stringsAreOnSameLine( (160 - 142)/2 + 142, 162, 141)
//     expect(areOnSameLine).toBeTrue
//   })
//   test('evaluates strings as not being on the same line, when they are clearly, visibly not aligned ', () => {
//     //'000-0000' and '2034' on gif
//     const areOnSameLine = initCellValueGenerator().stringsAreOnSameLine( (138 - 118)/2 + 118, 160, 142)
//     expect(areOnSameLine).toBeFalse
//   })
//   test('evaluates strings as being on the same line, when there appears to be enough overlap', () => {
//     //'000-0000' and 'INVOICE' on gif
//     const areOnSameLine = initCellValueGenerator().stringsAreOnSameLine( (138 - 118)/2 + 118, 136, 117)
//     expect(areOnSameLine).toBeTrue
//   })
//   test('evaluates strings as not being on the same line, when there does not appear to be enough overlap ', () => {
//     //'Name' and 'CUSTOMER' on gif
//     const areOnSameLine = initCellValueGenerator().stringsAreOnSameLine( (228 - 210)/2 + 210, 206, 186)
//     expect(areOnSameLine).toBeFalse
//   })
// })


// describe('parsing doc text using anchor phrases', () => {
//   describe('parsing doc text horizontally with anchor phrase', () => {
//     describe('parsing image files (GIF, TIFF, or non-searchable PDFs)', () => {

//       const initCellValueGenerator = () => {
//         return new CellValueGenerator(docTextGIF, wordListGIF, recurringDocGIFCellValues, '2020/09/01')
//       }

//       describe('parsing for word', () => {
//         test('gets word after anchor phrase using single string count; anchor phrase terminates partway through a word', () => {      
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocGIFCellValues.dataRows[0].dataCells[0].cellSects[0]) 
//           expect(textFound).toBe('ne:')
//         })
//         test('gets word after anchor phrase using single string count; anchor phrase terminates at end of a word', () => {       
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocGIFCellValues.dataRows[0].dataCells[0].cellSects[1]) 
//           expect(textFound).toBe('(000)')
//         })
//         test('gets word after anchor phrase using multi string count', () => {      
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocGIFCellValues.dataRows[0].dataCells[0].cellSects[2]) 
//           expect(textFound).toBe('2034')
//         })
//         test('returns empty string if string count exceeds remaining words on page', () => {       
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocGIFCellValues.dataRows[0].dataCells[0].cellSects[3]) 
//           expect(textFound).toBe('')
//         })
//       })
//       describe('parsing for phrase', () => {
//         test('gets phrase after anchor phrase using single string count; anchor phrase terminates partway through a larger phrase', () => {      
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocGIFCellValues.dataRows[0].dataCells[1].cellSects[0]) 
//           expect(textFound).toBe('000) 000-0000')
//         })
//         test('gets phrase after anchor phrase using single string count; anchor phrase terminates at end of a larger phrase', () => {       
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocGIFCellValues.dataRows[0].dataCells[1].cellSects[1]) 
//           expect(textFound).toBe('CUSTOMER ID')
//         })
//         test('gets phrase after anchor phrase using multi string count', () => {      
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocGIFCellValues.dataRows[0].dataCells[1].cellSects[2]) 
//           expect(textFound).toBe('375.00')
//         })
//         test('returns empty string if string count exceeds remaining phrases on page', () => {       
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocGIFCellValues.dataRows[0].dataCells[1].cellSects[3]) 
//           expect(textFound).toBe('')
//         })
//       })
//     })
//     describe('parsing searchable PDF', () => {

//       const initCellValueGenerator = () => {
//         return new CellValueGenerator(docTextPDF, wordListPDF, recurringDocPDFCellValues, '2020/09/01')
//       }

//       describe('parsing for phrase', () => {
//         test('gets phrase when it is embedded in the same larger phrase as the anchor phrase', () => {      
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[1].cellSects[3]) 
//           //page 1 of pdf - anchor phrase '123'
//           expect(textFound).toBe('Your Street')
//         })
//         test('gets phrase when it is not embedded in same larger phrase as the anchor phrase', () => {       
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[2].cellSects[0]) 
//           //page 1 of pdf - 'Adjustments'
//           expect(textFound).toBe('-$100.00')
//         })
//         test('gets phrase when there are additional phrases to the right of the target phrase', () => {  
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[2].cellSects[1]) 
//           //page 1 of pdf - 'Qty'
//           expect(textFound).toBe('Unit price')
//         })
//         test('returns empty string when anchor phrase not found', () => {     
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[2].cellSects[2]) 
//           expect(textFound).toBe('')
//         })
//         test('gets phrase from the first matching anchor phrase found (if anchor phrase exists multiple times on page)', () => {
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[2].cellSects[3]) 
//           //page 1 of pdf - 'Item'
//           expect(textFound).toBe('#1')
//         })
//         test('gets phrase from the first matching anchor phrase found (if anchor phrase exists multiple times on different pages)', () => {
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[3].cellSects[0]) 
//           //page 1 and 2 of pdf - 'Description'
//           expect(textFound).toBe('Qty')
//         })
//         test('gets phrase using multiple string counts, first string count being part of same larger phrase containing the anchor phrase', () => {
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[8].cellSects[0]) 
//           //page 1 of pdf - 'Payable' with string count 9 
//           expect(textFound).toBe('Due date')
//         })
//         test('returns empty string if anchor phrase is on different page from target string', () => {
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[8].cellSects[1]) 
//           //page 1 of pdf - 'Unit', with string count 19 and page 2 containing target phrase
//           expect(textFound).toBe('')
//         })
//         test('gets phrase using multiple string counts, first string count not being part of same larger phrase containing the anchor phrase', () => {
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[8].cellSects[2]) 
//           //page 1 of pdf - '123 Your Street' with string count 7 
//           expect(textFound).toBe('Invoice #')
//         })
//         test('returns empty string if anchor phrase is on different page from target string (second example)', () => {
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[8].cellSects[3]) 
//           //page 1 of pdf - 'Subtotal', with string count 9 and page 2 containing target phrase 
//           expect(textFound).toBe('')
//         })
//         test('returns empty string when phrase count exceeds phrases in doc', () => {
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[9].cellSects[0]) 
//           //page 2 of pdf - 'Category' with string count 20
//           expect(textFound).toBe('')
//         })
//       })
//     })
//   })
//   describe('parsing doc text vertically with anchor phrase', () => {
//     describe('parsing image files (GIF, TIFF, or non-searchable PDFs)', () => {

//       const initCellValueGenerator = () => {
//         return new CellValueGenerator(docTextGIF, wordListGIF, recurringDocGIF, '2020/09/01')
//       }

//       describe('parsing for word', () => {
//         test('gets first word that overlaps x-coords with anchor phrase (includes adjacent special chars after overlapping word)', () => {   
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocGIFCellValues.dataRows[0].dataCells[2].cellSects[0]) 
//           expect(textFound).toBe('Phone:')
//         })
//         test('gets first word that overlaps x-coords with anchor phrase (no adjacent special chars), with multi string count', () => {
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocGIFCellValues.dataRows[0].dataCells[2].cellSects[1]) 
//           expect(textFound).toBe('hours')
//         })
//         test('gets first word that overlaps x-coords with anchor phrase (includes adjacent special chars before and after overlapping word)', () => {
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocGIFCellValues.dataRows[0].dataCells[2].cellSects[2]) 
//           expect(textFound).toBe('21/02/2018')
//         })
//         test('gets first word that overlaps x-coords with anchor phrase (includes adjacent special chars before and after overlapping word), with multi string count', () => {
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocGIFCellValues.dataRows[0].dataCells[2].cellSects[3]) 
//           expect(textFound).toBe('(000)')
//         })
//       })
//       describe('parsing for phrase', () => {
//         test('gets phrase that overlaps x-coords with anchor phrase (line includes additional phrase afterward), with multi string count', () => {   
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocGIFCellValues.dataRows[0].dataCells[3].cellSects[0]) 
//           expect(textFound).toBe('Phone: (000) 000-0000')
//         })
//         test('gets first phrase that overlaps x-coords with anchor phrase (line includes additional phrase before)', () => {   
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocGIFCellValues.dataRows[0].dataCells[3].cellSects[1]) 
//           expect(textFound).toBe('21/02/2018')
//         })
//         test('gets phrase that overlaps x-coords with anchor phrase (line includes additional phrases before and after), with multi string count', () => {   
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocGIFCellValues.dataRows[0].dataCells[3].cellSects[2]) 
//           expect(textFound).toBe('564')
//         })
//         test('gets phrase that overlaps x-coords with anchor phrase (line includes additional phrases after), with multi string count', () => {   
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocGIFCellValues.dataRows[0].dataCells[3].cellSects[3]) 
//           expect(textFound).toBe('Thank you for your business!')
//         })
//       })
//     })
//     describe('parsing searchable PDF', () => {

//       const initCellValueGenerator = () => {
//         return new CellValueGenerator(docTextPDF, wordListPDF, recurringDocPDFCellValues, '2020/09/01')
//       }

//       describe('parsing for phrase', () => {
//         test('gets phrase, when there are one or more phrases to the right of the anchor phrase', () => {
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[3].cellSects[3]) 
//           //page 2 of pdf - 'Employee name'
//           expect(textFound).toBe('Manager')
//         })
//         test('gets target phrase using the first anchor phrase found (anchor phrase exists more than once on same page)', () => {
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[4].cellSects[0]) 
//           //page 2 of pdf - 'Date'
//           expect(textFound).toBe('9/4')
//         })
//         test('gets target phrase using the first anchor phrase found (anchor phrase exists more than once on different pages)', () => {
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[4].cellSects[1]) 
//           //page 1 & 2 of pdf - '(123) 456-7890'
//           expect(textFound).toBe('Invoice')
//         })
//         test('gets phrase when it is followed by one or more phrases to its right', () => {
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[4].cellSects[2]) 
//           //page 2 of pdf - 'Category'
//           expect(textFound).toBe('Flight')
//         })
//         test('returns empty string when anchor phrase not found', () => {     
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[4].cellSects[3]) 
//           expect(textFound).toBe('')
//         })
//         test('gets phrase using multiple string counts, anchor phrase being embedded in larger phrase', () => {
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[9].cellSects[1]) 
//           //page 1 of pdf - 'Submitted' with string count 9
//           expect(textFound).toBe('Notes:')
//         })
//         test('gets empty string when anchor phrase is not on same page as target phrase', () => {
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[9].cellSects[2]) 
//           //page 1 of pdf - '01/01/2000' with page 2 containing target phrase 
//           expect(textFound).toBe('')
//         })
//         test('gets phrase using multiple string counts, anchor phrase not being embedded in larger phrase', () => {
//           const textFound = initCellValueGenerator().getCellSectValueFromPosition(recurringDocPDFCellValues.dataRows[0].dataCells[9].cellSects[3]) 
//           //page 1 of pdf - 'Invoice #' with string count 8 
//           expect(textFound).toBe('Adjustments')
//         })
//       })
//     })
//   })
// })

  
// describe('getting cell values', () => {

//   const initCellValueGenerator = () => {
//     return new CellValueGenerator(docTextPDF, wordListPDF, recurringDocPDFCellValues, '2020/09/01')
//   }
  
//   test('gets cell value using regex, phrase positions, and customValue methods for the four cell sects; appendChars and date formatting also included', () => {    
//     const cellValue = initCellValueGenerator().getCellValue(recurringDocPDFCellValues.dataRows[0].dataCells[5])
//     expect(cellValue).toBe('Your Company---238HR03-Jan-2000$0.00  / @ test value')
//   })
//   test('gets cell value using today\'s date as the input method', () => {
//     const cellValue = initCellValueGenerator().getCellValue(recurringDocPDFCellValues.dataRows[0].dataCells[6])
//     expect(cellValue).toBe('2020/09/01')
//   })
//   test('gets empty string if recurringDoc cell has only one sect with empty searchOrInputMethod', () => {
//     const cellValue = initCellValueGenerator().getCellValue(recurringDocPDFCellValues.dataRows[0].dataCells[7])
//     expect(cellValue).toBe('')
//   })
// })


// describe('generating a CSV blueprint', () => {
//   test('gets blueprint (GIF from recurringDocs)',  async () => {
//     const cellValueGenerator = new CellValueGenerator(docTextGIF, wordListGIF, recurringDocGIF, '2020/09/01')
//     const expected = {
//       fileName: 'GIF.GIF',
//       CSVHeader: [
//         { id: '0', title: 'Date' },
//         { id: '1', title: 'Description' }
//       ],
//       CSVDataRows: [
//         { 0: '01-Sep-20', 1: 'Service Fee' }
//       ]
//     }
//     const actual = cellValueGenerator.getCSVBlueprint()
//     expect(JSON.stringify(actual)).toBe(JSON.stringify(expected))
//   })
//   test('gets blueprint (PDF_editable from recurringDocs)', async () => {
//     const cellValueGenerator = new CellValueGenerator(docTextPDF, wordListPDF, recurringDocPDF, '2020/09/01')
//     const expected = {
//       fileName: 'PDF_editable.pdf',
//       CSVHeader: [
//         {id: '0', title: 'Invoice #'},
//         {id: '1', title: 'Custom Value'}
//       ],
//       CSVDataRows: [
//         { 0: '123456', 1: 'test123' },
//         { 0: '', 1: 'test 456' }
//       ]
//     }
//     const actual = cellValueGenerator.getCSVBlueprint()
//     expect(JSON.stringify(actual)).toBe(JSON.stringify(expected))
//   })
// })
