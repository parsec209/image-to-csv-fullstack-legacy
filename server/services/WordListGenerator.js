/**
 * WordListGenerator module - see {@tutorial WordListGenerator-tutorial}
 * @module WordListGenerator
 */

const { validateArgs } = require('../util/ArgsValidator')

// @ts-check
 
 
/**
 * Class to create wordListGenerator object
 */
class WordListGenerator {
  /**
   * Creates wordListGenerator
   * @param {DocText} docText - Doc text used in the word list generation
   */
  constructor (docText) {
    validateArgs(['{fileName: String, extraction: Array}'], arguments)
    this.docText = docText
  }

 
  /**
   * Compiles a list of all the words within a doc
   * @returns {WordList} - Word list 
   */
  getWordList() {
    const docWords = []
    this.docText.extraction.forEach(function(docPage) {
      const pageWords = []
      //fullTextAnnotation property is null for page with no text
      if (docPage.fullTextAnnotation) {
        //the pages property in the fullTextAnnotation API response will always have length of 1, it is not to be confused with the actual doc pages
        docPage.fullTextAnnotation.pages.forEach(function(page) {
          page.blocks.forEach(function(block) {
            block.paragraphs.forEach(function(paragraph) {
              paragraph.words.forEach(function(word) {
                pageWords.push(word)
              })       
            })
          })
        })
      }
      docWords.push(pageWords)
    })
    return { fileName: this.docText.fileName, words: docWords }
  }

  
  /**
   * Sorts words in the word list, using their coordinates
   * @param {WordList} wordList - Word list
   * @returns {void}
   */
  sortWordList(wordList) {
    validateArgs(['{fileName: String, words: [Array]}'], arguments)
    wordList.words.forEach(function(page) {
      if (page.length) {
        page.sort(function(a, b) {    
          let vertexType = a.boundingBox.vertices.length ? 'vertices' : 'normalizedVertices'

          //if word A's bottom y coordinate is less than the vertical midpoint of word B, word A is sorted before word B
          if (a.boundingBox[vertexType][2].y < (b.boundingBox[vertexType][0].y + b.boundingBox[vertexType][2].y)/2) {
            return -1

            //if word A's vertical midpoint is greater than the bottom y coordinate of word B, word A is sorted after word B
          } else if ((a.boundingBox[vertexType][0].y + a.boundingBox[vertexType][2].y)/2 > b.boundingBox[vertexType][2].y) {
            return 1

            //if neither of the preceding statements is true, then the word with the lesser left x coordinate gets sorted first
          } else {
            return 0 || a.boundingBox[vertexType][0].x - b.boundingBox[vertexType][0].x
          }
        })
      }
    })
  }
}

 
module.exports = WordListGenerator
 
 
 
 