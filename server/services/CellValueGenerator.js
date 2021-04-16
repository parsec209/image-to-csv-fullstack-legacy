/**
 * CellValueGenerator module - see {@tutorial CellValueGenerator-tutorial}
 * @module CellValueGenerator
 */

const moment  = require('moment')
const { validateArgs } = require('../util/ArgsValidator')

// @ts-check


/**
 * Class to create cellValueGenerator object
 */
class CellValueGenerator {
  /**
   * Create cellValueGenerator 
   * @param {DocText} docText -  Doc text
   * @param {DocLines} docTextLines - Sorted doc text lines
   * @param {Object} recurringDoc - Mongoose Doc model instance (recurring document)
   * @param {string} dateToday - Today's date 
   */
  constructor (docText, docTextLines, recurringDoc, dateToday) {
    validateArgs([
      '{fileName: String, extraction: Array}', 
      '{fileName: String, textLines: [Array]}', 
      '{_id: Object, name: String, idPhrase: String, header: Array, dataRows: Array, user: Object, ...}', 
      'String'
    ], arguments)
    this.docText = docText
    this.docTextLines = docTextLines
    this.recurringDoc = recurringDoc
    this.dateToday = dateToday
  }


  /**
   * Formats cell section value as a date 
   * @param {string} cellSectValue - CSV cell section value
   * @param {Object} recurringDocCellSect - Recurring doc cell section 
   * @returns {string} - Cell section value formatted as date
   */
  getFormattedDate(cellSectValue, recurringDocCellSect) {
    validateArgs(['String', '{searchOrInputMethod: Maybe String, ...}'], arguments)
    const dateFormat = recurringDocCellSect.dateFormat || 'YYYY/MM/DD'
    const daysAdded = recurringDocCellSect.daysAdded || 0
    const formattedDate = moment(cellSectValue).add(daysAdded, 'days').format(dateFormat)
    if (formattedDate === 'Invalid date') {
      return ''
    }
    return formattedDate
  }


  /**
   * Finds cell section value using regular expression. 
   * @param {Object} recurringDocCellSect - Recurring doc cell section 
   * @returns {string} - CSV cell section value
   */
  getCellSectValueFromPattern(recurringDocCellSect) {
    validateArgs(['{searchOrInputMethod: Maybe String, ...}'], arguments)
    let cellSectValue = ''
    let regEx = new RegExp(recurringDocCellSect.phraseOrValue)
    for (let i = 0; i < this.docText.extraction.length; i++) {
      let page = this.docText.extraction[i]
      if (page.fullTextAnnotation) {
        let match = regEx.exec(page.fullTextAnnotation.text)
        if (match) {
          cellSectValue = match[0]
          return cellSectValue
        }    
      }
    }
    return cellSectValue
  }


  /**
   * Gets vertical midpoint of {@link Line}
   * @param {number} yLowerRightVertex - Lower right y coordinate of line
   * @param {number} yUpperLeftVertex - Upper left y coordinate of line
   * @returns {number} - Vertical midpoint of line
   */
  getLineVerticalMidPoint(yLowerRightVertex, yUpperLeftVertex) {
    validateArgs(['Number', 'Number'], arguments)
    const verticalMidPoint = (yLowerRightVertex - yUpperLeftVertex)/2 + yUpperLeftVertex
    return verticalMidPoint
  }


  /**
   * Gets vertices of phraseOrValue
   * @param {number} phraseOrValueStartIndex - Index of {@link LineText} where phraseOrValue begins
   * @param {number} phraseOrValueEndIndex - Index of {@link LineText} where phraseOrValue ends
   * @param {Line} line - Line
   * @returns {{xUpperLeft: number, yUpperLeft: number, xLowerRight: number, yLowerRight: number }} - Vertices of phraseOrValue
   */
  getPhraseOrValueVertices(phraseOrValueStartIndex, phraseOrValueEndIndex, line) {
    validateArgs(['Number', 'Number', '{words: Array, vertices: Object, text: String}'], arguments)
    const phraseOrValueVertices = {}
    for (let n = 0; n < line.words.length; n++) {
      let word = line.words[n]
      //finding the first and last words in the phraseOrValue; we will use the first word's upper left and the last word's lower right vertices as the phraseOrValue vertices
      if (phraseOrValueStartIndex >= word.startIndex && phraseOrValueStartIndex <= word.endIndex) {
        phraseOrValueVertices.xUpperLeft = word.vertices[0].x
        phraseOrValueVertices.yUpperLeft = word.vertices[0].y
      } if (phraseOrValueEndIndex >= word.startIndex && phraseOrValueEndIndex <= word.endIndex) {
        phraseOrValueVertices.xLowerRight = word.vertices[2].x
        phraseOrValueVertices.yLowerRight = word.vertices[2].y
        break
      }
    }
    return phraseOrValueVertices
  }


  /**
   * Determines if two lines share more than half of their y-coordinates. If so, they are considered to be on the same horizontal plane 
   * @param {number} verticalMidPointLineOne - First line's vertical midpoint
   * @param {number} yLowerRightVertexLineTwo - Second line's lower right y-coordinate
   * @param {number} yUpperLeftVertexLineTwo - Second line's upper left y-coordinate
   * @returns {boolean} - Whether lines are, or are not, on same horizontal plane
   */
  linesAreOnSameHorizontalPlane(verticalMidPointLineOne, yLowerRightVertexLineTwo, yUpperLeftVertexLineTwo) {
    validateArgs(['Number', 'Number', 'Number'], arguments)
    if (yLowerRightVertexLineTwo > verticalMidPointLineOne && yUpperLeftVertexLineTwo < verticalMidPointLineOne) {
      return true 
    } else {
      return false
    }
  }


  /**
   * Use left anchor phrase to find CSV cell section value
   * @param {PageLines} page - Page lines
   * @param {number} pageIndex - Index of {@link DocLines}.textLines, representing a page number 
   * @param {number} phraseOrValueEndIndex - Index of {@link LineText} where phraseOrValue ends
   * @returns {string} - CSV cell section value
   */
  getCellSectValueFromLeftPhrase(page, pageIndex, phraseOrValueEndIndex) {
    validateArgs(['{fullTextAnnotation: Maybe Object, ...}', 'Number', 'Number'], arguments)
    let cellSectValue = ''
    const line = page[pageIndex]
    //if the current line containing the phraseOrValue has additional text after the phraseOrValue, that additional text will be the cell section value
    if (line.text.length - 1 > phraseOrValueEndIndex) {
      cellSectValue = line.text.substring(phraseOrValueEndIndex + 1)
    //if current line does not have any text after the phraseOrValue (meaning there is a line break right after the phraseOrValue), the next line's text will be the cellSectValue
    } else {  
      const nextLine = page[pageIndex + 1]
      const currentLineVerticalMidPoint = this.getLineVerticalMidPoint(line.vertices.yLowerRight, line.vertices.yUpperLeft)
      if (this.linesAreOnSameHorizontalPlane(currentLineVerticalMidPoint, nextLine.vertices.yLowerRight, nextLine.vertices.yUpperLeft)) {
        cellSectValue = nextLine.text
      }
    }
    return cellSectValue
  }


  /**
   * Use top anchor phrase to find CSV cell section value
   * @param {PageLines} page - Page lines
   * @param {number} pageIndex - Index of {@link DocLines}.textLines, representing a page number 
   * @param {number} phraseOrValueStartIndex - Index of {@link LineText} where phraseOrValue starts
   * @param {number} phraseOrValueEndIndex - Index of {@link LineText} where phraseOrValue ends
   * @returns {string} - CSV cell section value
   */
  getCellSectValueFromTopPhrase(page, pageIndex, phraseOrValueStartIndex, phraseOrValueEndIndex) {
    validateArgs(['{fullTextAnnotation: Maybe Object, ...}', 'Number', 'Number', 'Number'], arguments)
    let cellSectValue = ''
    const phraseOrValueVertices = this.getPhraseOrValueVertices(phraseOrValueStartIndex, phraseOrValueEndIndex, page[pageIndex])
    for (let i = pageIndex + 1; i < page.length; i++) {
      let line = page[i]
      let phraseOrValueVerticalMidPoint = this.getLineVerticalMidPoint(phraseOrValueVertices.yLowerRight, phraseOrValueVertices.yUpperLeft)
      //looks for the first line below phraseOrValue that shares an x coordinate with phraseOrValue; if found, that line's text will be the cell section value
      if (line.vertices.xLowerRight > phraseOrValueVertices.xUpperLeft && line.vertices.xUpperLeft < phraseOrValueVertices.xLowerRight && !this.linesAreOnSameHorizontalPlane(phraseOrValueVerticalMidPoint, line.vertices.yLowerRight, line.vertices.yUpperLeft)) {
        cellSectValue = line.text
        return cellSectValue
      }
    }
    return cellSectValue
  }


  /**
   * Gets CSV cell section value using anchor phrases
   * @param {Object} recurringDocCellSect - Recurring doc cell section 
   * @returns {string} - CSV cell section value
   */
  getCellSectValueFromPosition(recurringDocCellSect) {
    validateArgs(['{searchOrInputMethod: Maybe String, ...}'], arguments)
    for (let i = 0; i < this.docTextLines.textLines.length; i++) {
      let page = this.docTextLines.textLines[i]
      for (let i = 0; i < page.length; i++) {
        let line = page[i]
        let phraseOrValueStartIndex = line.text.indexOf(recurringDocCellSect.phraseOrValue)
        //if phraseOrValue found in line text
        if (phraseOrValueStartIndex !== -1) {
          let phraseOrValueEndIndex = phraseOrValueStartIndex + recurringDocCellSect.phraseOrValue.length - 1
          //now that the position of the phraseOrValue (anchor phrase) is known, we can parse for the cell section value
          if (recurringDocCellSect.searchOrInputMethod === 'leftPhrase') {
            return this.getCellSectValueFromLeftPhrase(page, i, phraseOrValueEndIndex)
          } else if (recurringDocCellSect.searchOrInputMethod === 'topPhrase') {
            return this.getCellSectValueFromTopPhrase(page, i, phraseOrValueStartIndex, phraseOrValueEndIndex)
          }
        }
      }
    }
    return ''
  }


  /**
   * Gets CSV cell section value using SearchOrInput method; if applicable, will also format as date and append characters 
   * @param {Object} recurringDocCellSect - Recurring doc cell section 
   * @returns {string} - CSV cell section value
   */
  getCellSectValue(recurringDocCellSect) {
    validateArgs(['{searchOrInputMethod: Maybe String, ...}'], arguments)
    let cellSectValue = ''
    if (recurringDocCellSect.searchOrInputMethod === 'pattern') {
      cellSectValue = this.getCellSectValueFromPattern(recurringDocCellSect)
    } else if (recurringDocCellSect.searchOrInputMethod === 'topPhrase' || recurringDocCellSect.searchOrInputMethod === 'leftPhrase') {
      cellSectValue = this.getCellSectValueFromPosition(recurringDocCellSect)
    } else if (recurringDocCellSect.searchOrInputMethod === 'customValue') {
      cellSectValue = recurringDocCellSect.phraseOrValue
    } else if (recurringDocCellSect.searchOrInputMethod === 'today') {
      cellSectValue = this.dateToday
    } 
    if (recurringDocCellSect.dateFormat || recurringDocCellSect.daysAdded) {
      cellSectValue = this.getFormattedDate(cellSectValue, recurringDocCellSect)
    }
    if (recurringDocCellSect.appendChars) {
      cellSectValue += recurringDocCellSect.appendChars 
    }
    cellSectValue.trimStart()
    return cellSectValue
  }


  /**
   * Combines the individual CSV cell section values into one CSV cell value 
   * @param {Object} recurringDocCell - Recurring doc cell  
   * @returns {string} - CSV cell value
   */
  getCellValue(recurringDocCell) {
    validateArgs(['{cellSects: Array, ...}'], arguments)
    const self = this
    let cellValue = ''
    recurringDocCell.cellSects.forEach(recurringDocCellSect => {
      const cellSectValue = self.getCellSectValue(recurringDocCellSect)
      cellValue += cellSectValue  
    })
    return cellValue
  }
 
  
  /**
   * Compile CSV header data
   * @returns {Header} - CSV header 
   */
  getCSVHeader() {
    const CSVHeader = []
    this.recurringDoc.header.forEach((recurringDocHeaderCell, headerCellIndex) => {
      CSVHeader.push({ id: headerCellIndex.toString(), title: recurringDocHeaderCell.value })
    })
    return CSVHeader
  }
  

  /**
   * Compile CSV row data
   * @param {Header} CSVHeader - CSV header
   * @returns {Array<Object>} - CSV row data
   */
  getCSVDataRows(CSVHeader) {
    validateArgs(['[{ id: String, title: String }]'], arguments) 
    const self = this
    const CSVDataRows = []
    this.recurringDoc.dataRows.forEach(recurringDocRow => {
      const dataRow = {}
      recurringDocRow.dataCells.forEach((recurringDocCell, recurringDocCellIndex) => {
        const cellValue = self.getCellValue(recurringDocCell)
        dataRow[CSVHeader[recurringDocCellIndex]['id']] = cellValue
      })
      CSVDataRows.push(dataRow)
    })
    return CSVDataRows
  }


  /**
   * Compile all CSV data for a doc 
   * @returns {CSVBlueprint} - CSV blueprint
   */
  getCSVBlueprint() { 
    const CSVBlueprint = { fileName: this.docText.fileName }
    const CSVHeader = this.getCSVHeader()
    const CSVDataRows = this.getCSVDataRows(CSVHeader)
    CSVBlueprint.CSVHeader = CSVHeader
    CSVBlueprint.CSVDataRows = CSVDataRows
    return CSVBlueprint
  }
}


module.exports = CellValueGenerator