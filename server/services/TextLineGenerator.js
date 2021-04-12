/**
 * TextLineGenerator module - see {@tutorial TextLineGenerator-tutorial}
 * @module TextLineGenerator
 */

const { validateArgs } = require('../util/ArgsValidator')

// @ts-check


/**
 * Class to create textLineGenerator object
 */
class TextLineGenerator {
  /**
   * Creates textLineGenerator
   * @param {DocText} docText - Doc text used in the line generation
   */
  constructor (docText) {
    validateArgs(['{fileName: String, extraction: Array}'], arguments)
    this.docText = docText
  }


  /**
   * Creates a line word
   * @param {ParagraphWord} paragraphWord - Paragraph word
   * @param {LineText} - Line text
   * @returns {LineWord} - Line word
   */
  getLineWord(paragraphWord, lineText) {
    validateArgs(['{symbols: Array, boundingBox: Object, confidence: Number, ...}', 'String'], arguments)
    const wordText = paragraphWord.symbols.map(symbol => symbol.text).join('')
    //A word's bounding box property will contain "normalizedVertices" from pdf files, and "vertices" from tiff and gif files
    const vertices = paragraphWord.boundingBox.vertices.length ? paragraphWord.boundingBox.vertices : paragraphWord.boundingBox.normalizedVertices  
    const lineWord = {
      wordText,
      vertices,
      startIndex: lineText.length,
      endIndex: lineText.length + wordText.length - 1
    }
    return lineWord
  }


  /**
   * Gets line vertices
   * @param {Array<LineWord>} lineWords - Line words
   * @returns {LineVertices} - Line vertices
   */
  getLineVertices(lineWords) { 
    validateArgs(['[{wordText: String, vertices: Array, startIndex: Number, endIndex: Number}]'], arguments)
    let xUpperLeft = 10000
    let yUpperLeft = 10000
    let xLowerRight = 0
    let yLowerRight = 0
    //the outermost vertices (lowest, highest, leftmost, rightmost) found within the line words will be used as the line vertices
    lineWords.forEach(function(word) { 
      [
        [word.vertices[0].x, word.vertices[3].x].forEach(function(v) {
          v < xUpperLeft ? xUpperLeft = v : xUpperLeft = xUpperLeft
        }),
        [word.vertices[0].y, word.vertices[1].y].forEach(function(v) {
          v < yUpperLeft ? yUpperLeft = v : yUpperLeft = yUpperLeft
        }),
        [word.vertices[1].x, word.vertices[2].x].forEach(function(v) {
          v > xLowerRight ? xLowerRight = v : xLowerRight = xLowerRight 
        }),
        [word.vertices[2].y, word.vertices[3].y].forEach(function(v) {
          v > yLowerRight ? yLowerRight = v : yLowerRight  
        }) 
      ]
    })
    const lineVertices = { xUpperLeft, yUpperLeft, xLowerRight, yLowerRight }
    return lineVertices
  }


  /**
   * Determines how much space must exist between two words to define a line break
   * @param {ParagraphWord} currentWord - current paragraph word 
   * @param {ParagraphWord} nextWord - next paragraph word
   * @returns {boolean} - true if breakpoint requirements met, false otherwise
   */
  isLineBreakPoint(currentWord, nextWord) {
    validateArgs(['{symbols: Array, boundingBox: Object, confidence: Number, ...}', '{symbols: Array, boundingBox: Object, confidence: Number, ...}'], arguments)
    const currentWordVertices = currentWord.boundingBox.vertices.length ? currentWord.boundingBox.vertices : currentWord.boundingBox.normalizedVertices 
    const nextWordVertices = nextWord.boundingBox.vertices.length ? nextWord.boundingBox.vertices : nextWord.boundingBox.normalizedVertices 
    const currentWordEnd = currentWordVertices[1].x 
    const nextWordStart = nextWordVertices[0].x
    const spaceBeforeNextWord = nextWordStart - currentWordEnd 
    const currentWordHeight = currentWordVertices[3].y - currentWordVertices[0].y
    if (spaceBeforeNextWord < currentWordHeight) {
      return false
    }
    return true
  }


  /**
   * Gets all lines within a paragraph
   * @param {Paragraph} paragraph - Paragraph 
   * @returns {Array<Line>} - Lines within paragraph
   */
  getParagraphLines(paragraph) {
    validateArgs(['{words: Array, boundingBox: Object, confidence: Number, ...}'], arguments)
    const self = this
    const paragraphLines = []
    let line = {
      words: [],
      vertices: {},
      text: ''
    }
    paragraph.words.forEach(function(paragraphWord, index) {
      const lineWord = self.getLineWord(paragraphWord, line.text)
      line.words.push(lineWord)
      line.text += lineWord.wordText 
      const lastSymbol = paragraphWord.symbols[paragraphWord.symbols.length - 1]
      if (lastSymbol.property && lastSymbol.property.detectedBreak) {
        const nextParagraphWord = paragraph.words[index + 1]
        //other detected break types from the GCP Vision API, such as EOL_SURE_SPACE or LINE_BREAK, qualify as line breaks without checking further conditions       
        if (lastSymbol.property.detectedBreak.type === 'SPACE' && nextParagraphWord && !self.isLineBreakPoint(paragraphWord, nextParagraphWord)) {
          //is not a break here and words will continue to be added to this line
          line.text += ' '
        } else {  
          //is a break here and the line is complete
          const lineVertices = self.getLineVertices(line.words)
          line.vertices = lineVertices
          paragraphLines.push(line)
          line = {
            words: [],
            vertices: {},
            text: ''
          }
        }
      }
    })
    return paragraphLines
  }


  /**
   * Gets all lines within a page
   * @param {AnnotateImageResponse} response - Extracted page text
   * @returns {PageLines} - Page lines
   */
  getPageLines(response) {
    validateArgs(['{fullTextAnnotation: Maybe Object, ...}'], arguments)
    const self = this
    const pageLines = []
    //fullTextAnnotation property is null for page with no text
    if (response.fullTextAnnotation) {
      response.fullTextAnnotation.pages.forEach(function(page) {
        page.blocks.forEach(function(block) {
          block.paragraphs.forEach(function(paragraph) {
            const paragraphLines = self.getParagraphLines(paragraph)
            paragraphLines.forEach(function(line) {
              pageLines.push(line)
            })       
          })
        })
      })
    }
    return pageLines
  }


  /**
   * Gets all lines within a doc
   * @returns {DocLines} - Doc lines
   */
  getDocLines() {
    //validateArgs(['{fileName: String, extraction: Array}'], arguments)
    const self = this
    const docLines = []
    //each response is a doc page
    this.docText.extraction.forEach(function(response) {
      const pageLines = self.getPageLines(response)
      docLines.push(pageLines)
    })
    return { fileName: this.docText.fileName, textLines: docLines }
  }


  /**
   * Sorts doc lines
   * @param {DocLines} docLines - Doc lines
   * @returns {void}
   */
  sortDocLines(docLines) {
    validateArgs(['{fileName: String, textLines: [Array]}'], arguments)
    docLines.textLines.forEach(function(page) {
      if (page.length) {
        page.sort(function(a, b) {       
          if (a.vertices.yLowerRight < (b.vertices.yLowerRight + b.vertices.yUpperLeft)/2) {
            //if line A's lower right corner y coordinate is less than the vertical midpoint of line B, line A is sorted before line B
            return -1
          } else if ((a.vertices.yLowerRight + a.vertices.yUpperLeft)/2 > b.vertices.yLowerRight) {
            //if line A's vertical midpoint is greater than the lower right corner y coordinate of line B, line A is sorted after line B
            return 1
          } else {
            //if neither of the preceding statements is true, then the line with the lesser upper left corner x coordinate gets sorted first
            return 0 || a.vertices.xUpperLeft - b.vertices.xUpperLeft
          }
        })
      }
    })
  }
}





module.exports = TextLineGenerator



