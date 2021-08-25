const fsPromises = require('fs').promises
const WordListGenerator = require('../services/WordListGenerator')



let docTextPDF
let docTextGIF


let modelWordListPDF
let modelWordListGIF
let modelSortedWordListPDF
let modelSortedWordListGIF


const getJSON = async (dir, fileName) => {
  const file = await fsPromises.readFile(__dirname + `/seeds/wordLists/${dir}/${fileName}`)
  return JSON.parse(file)
}


beforeAll(async () => {
  docTextPDF = await getJSON('docText', 'PDF_editable.json')
  docTextGIF = await getJSON('docText', 'GIF.json')
  modelWordListPDF = await getJSON('presort', 'PDF_editable.json')
  modelWordListGIF = await getJSON('presort', 'GIF.json')
  modelSortedWordListPDF = await getJSON('sorted', 'PDF_editable.json')
  modelSortedWordListGIF = await getJSON('sorted', 'GIF.json')
})


describe('instantiates WordListGenerator', () => {
  test('initializes constructor', () => {
    const wordListGenerator = new WordListGenerator(docTextPDF)
    expect(wordListGenerator.docText).toBeTruthy()
  })
})


describe('getting word list', () => {
  test('gets words from a multi-page document including a blank page (PDF_editable.pdf)', () => {
    const actualWords = new WordListGenerator(docTextPDF).getWordList()
    expect(JSON.stringify(actualWords)).toBe(JSON.stringify(modelWordListPDF))
  })
  test('gets words from single page document (GIF.GIF)', () => {
    const actualWords = new WordListGenerator(docTextGIF).getWordList()
    expect(JSON.stringify(actualWords)).toBe(JSON.stringify(modelWordListGIF))
  })
})


describe('sorting word list', () => {
  test('sorts word list (PDF_editable.pdf)', () => {
    const wordList = modelWordListPDF
    new WordListGenerator(docTextPDF).sortWordList(wordList)
    expect(JSON.stringify(wordList)).toBe(JSON.stringify(modelSortedWordListPDF))
  })
  test('sorts word list (GIF.GIF)', () => {
    const wordList = modelWordListGIF
    new WordListGenerator(docTextGIF).sortWordList(wordList)
    expect(JSON.stringify(wordList)).toBe(JSON.stringify(modelSortedWordListGIF))
  })
})








  