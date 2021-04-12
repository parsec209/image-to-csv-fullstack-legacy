const fsPromises = require('fs').promises
const TextLineGenerator = require('../services/TextLineGenerator')



let docTextPDF
let docTextGIF
let modelTextLinesPDF
let modelTextLinesGIF
let modelSortedTextLinesPDF
let modelSortedTextLinesGIF


const getJSON = async (dir, fileName) => {
  const file = await fsPromises.readFile(__dirname + `/seeds/textLines/${dir}/${fileName}`)
  return JSON.parse(file)
}


beforeAll(async () => {
  docTextPDF = await getJSON('docText', 'PDF_editable.json')
  docTextGIF = await getJSON('docText', 'GIF.json')
  modelTextLinesPDF = await getJSON('presort', 'PDF_editable.json')
  modelTextLinesGIF = await getJSON('presort', 'GIF.json')
  modelSortedTextLinesPDF = await getJSON('sorted', 'PDF_editable.json')
  modelSortedTextLinesGIF = await getJSON('sorted', 'GIF.json')
})


describe('instantiates TextLineGenerator', () => {
  test('initializes constructor', () => {
    const textLineGenerator = new TextLineGenerator(docTextPDF)
    expect(textLineGenerator.docText).toBeTruthy()
  })
})


describe('getting line word', () => {
  test('gets lineWord with text "Name" at the top left of GIF.GIF file',  () => {
    const paragraphWord = docTextGIF.extraction[0].fullTextAnnotation.pages[0].blocks[0].paragraphs[0].words[2]
    const modelWord = modelTextLinesGIF.textLines[0][0].words[2]
    const actualWord = new TextLineGenerator(docTextGIF).getLineWord(paragraphWord, '[Company ')
    expect(JSON.stringify(actualWord)).toBe(JSON.stringify(modelWord))
  })
})


describe('getting line vertices', () => {
  test('gets line vertices from line with text "[Company Name]" at the top left of GIF.GIF file',  () => {
    const sampleTextLine = modelTextLinesGIF.textLines[0][0]
    const testVertices = new TextLineGenerator(docTextGIF).getLineVertices(sampleTextLine.words)
    expect(JSON.stringify(testVertices)).toBe(JSON.stringify(sampleTextLine.vertices))
  })
})


describe('determining line break points', () => {
  test('space between "Qty" and "Unit Price" creates new line on first page of PDF_editable file',  () => {
    const textParagraph = docTextPDF.extraction[0].fullTextAnnotation.pages[0].blocks[2].paragraphs[0]
    const currentWord = textParagraph.words[1]
    const nextWord = textParagraph.words[2]
    expect(new TextLineGenerator(docTextPDF).isLineBreakPoint(currentWord, nextWord)).toBe(true)
  })
  test('space between "Unit" and "Price" does not create a new line on first page of PDF_editable file',  () => {
    const textParagraph = docTextPDF.extraction[0].fullTextAnnotation.pages[0].blocks[2].paragraphs[0]
    const currentWord = textParagraph.words[2]
    const nextWord = textParagraph.words[3]
    expect(new TextLineGenerator(docTextPDF).isLineBreakPoint(currentWord, nextWord)).toBe(false)
  })
})


describe('getting paragraph lines', () => {
  test('gets all lines inside paragraph starting with "[Street Address]" and ending in "Phone: (000) 000-0000" in GIF.GIF file',  () => {
    const paragraph = docTextGIF.extraction[0].fullTextAnnotation.pages[0].blocks[2].paragraphs[0]
    const modelLines = modelTextLinesGIF.textLines[0].slice(2, 5)
    const actualLines = new TextLineGenerator(docTextGIF).getParagraphLines(paragraph)
    expect(JSON.stringify(actualLines)).toBe(JSON.stringify(modelLines))
  })
  test('gets all lines inside paragraph starting with "Invoice for" and ending in "1/3/2000" in page one of PDF_editable.pdf file',  () => {
    const paragraph = docTextPDF.extraction[0].fullTextAnnotation.pages[0].blocks[1].paragraphs[0]
    const modelLines = modelTextLinesPDF.textLines[0].slice(6, 19)
    const actualLines = new TextLineGenerator(docTextPDF).getParagraphLines(paragraph)
    expect(JSON.stringify(actualLines)).toBe(JSON.stringify(modelLines))
  })
})


describe('getting page lines', () => {
  test('gets all lines from document page containing text (page 2 of PDF_editable.pdf)',  () => {
    const page = docTextPDF.extraction[1]
    const modelLines = modelTextLinesPDF.textLines[1]
    const actualLines = new TextLineGenerator(docTextPDF).getPageLines(page)
    expect(JSON.stringify(actualLines)).toBe(JSON.stringify(modelLines))
  })
  test('returns empty array for page with no text (page 3 of PDF_editable.pdf)', () => {
    const page = docTextPDF.extraction[2]
    const actualLines = new TextLineGenerator(docTextPDF).getPageLines(page)
    expect(JSON.stringify(actualLines)).toBe('[]')
  })
})


describe('getting doc lines', () => {
  test('gets lines from a multi-page document including a blank page (PDF_editable.pdf)', () => {
    const actualLines = new TextLineGenerator(docTextPDF).getDocLines()
    expect(JSON.stringify(actualLines)).toBe(JSON.stringify(modelTextLinesPDF))
  })
  test('gets lines from single page document (GIF.GIF)', () => {
    const actualLines = new TextLineGenerator(docTextGIF).getDocLines()
    expect(JSON.stringify(actualLines)).toBe(JSON.stringify(modelTextLinesGIF))
  })
})


describe('sorting doc lines', () => {
  test('sorts text lines (PDF_editable.pdf)', () => {
    const docLines = modelTextLinesPDF
    new TextLineGenerator(docTextPDF).sortDocLines(docLines)
    expect(JSON.stringify(docLines)).toBe(JSON.stringify(modelSortedTextLinesPDF))
  })
  test('sorts text lines (GIF.GIF)', () => {
    const docLines = modelTextLinesGIF
    new TextLineGenerator(docTextGIF).sortDocLines(docLines)
    expect(JSON.stringify(docLines)).toBe(JSON.stringify(modelSortedTextLinesGIF))
  })
})








  