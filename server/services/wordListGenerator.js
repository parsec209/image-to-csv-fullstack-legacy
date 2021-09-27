/**
 * wordListGenerator module - see {@tutorial wordListGenerator-tutorial}
 * @module wordListGenerator
 */

const { validateArgs, schemas } = require('../util/argsValidator')



// @ts-check
 

/**
 * Puts all the doc words from an image annotation response into a 2D array, consisting of the doc (outer) and its pages (inner)
 * @param {DocText} docText - Doc text containing the words
 * @returns {WordList} - Word list 
 */
const getWordList = function(docText) {
  validateArgs(arguments, { 0: schemas.docText })
  const docWords = []
  docText.extraction.forEach(function(docPage) {
    const pageWords = []
    //fullTextAnnotation is null for a page with no text
    if (docPage.fullTextAnnotation) {
      //the pages property of the fullTextAnnotation will always have length of 1; in this case it is a somewhat misleading name and is not to be confused with docPage, which is an actual page of the doc
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
  return { fileName: docText.fileName, words: docWords }
}


/**
 * Sorts words in the word list by their coordinates (left to right, line by line)
 * @param {WordList} wordList - Word list
 * @returns {void}
 */
const sortWordList = function(wordList) {
  validateArgs(arguments, { 0: schemas.wordList })
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



module.exports = { getWordList, sortWordList }
 
 
 