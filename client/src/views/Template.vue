<template>
  <div>
    <Navbar/>
    <br>
    <div class="container">
      <br>
      <b-card header-tag="header" footer-tag="footer">
        <template #header>
          <div class="text-center">
            <b-alert :show="postError.length > 0" variant="danger">{{ postError }}</b-alert>
            <div v-if="isLoading">
              <b-spinner variant="secondary" label="loading"></b-spinner>
            </div>   
            <h3>{{ templateType === 'doc' ? 'Recurring Document' : 'CSV Header' }}</h3>
          </div>
        </template>
        <br>
        <b-form @submit.prevent="submitTemplate" @input="postError = ''">
          <b-row>
            <b-col md="6" offset-md="3">
              <b-form-group label="Name:" label-for="name-input">
                <b-form-input 
                  id="name-input"
                  :placeholder="`Enter ${templateType} name`" 
                  v-model="$v.form.name.$model" 
                  :state="validateState($v.form.name)" 
                  aria-describedby="name-live-feedback"
                >
                </b-form-input>
                <b-form-invalid-feedback id="name-live-feedback">Name required</b-form-invalid-feedback>
              </b-form-group>
              <b-form-group v-if="templateType === 'doc'" label="ID Phrase:" label-for="idPhrase-input">
                <b-form-input       
                  id="idPhrase-input"
                  placeholder="Enter ID phrase" 
                  v-model="$v.form.idPhrase.$model" 
                  :state="validateState($v.form.idPhrase)" 
                  aria-describedby="idPhrase-live-feedback"
                >
                </b-form-input>
                <b-badge variant="secondary" href="#" id="phrase-tip">
                  <b-icon icon="question-circle-fill" aria-label="phrase-tip"></b-icon>
                </b-badge>
                <b-popover target="phrase-tip" triggers="hover focus">
                  <InstructionsDocID/>
                </b-popover>
                <b-form-invalid-feedback id="idPhrase-live-feedback">ID phrase required</b-form-invalid-feedback>
              </b-form-group>
              <b-form-group v-if="templateType === 'doc'" label="Second ID Phrase (Optional):" label-for="idPhrase2-input">
                <b-form-input       
                  id="idPhrase2-input"
                  placeholder="Enter second ID phrase" 
                  v-model="$v.form.idPhrase2.$model" 
                  aria-describedby="idPhrase2-live-feedback"
                >
                </b-form-input>
              </b-form-group>
            </b-col>
          </b-row>
          <br>
          <div class="text-center" v-if="templateType === 'doc'">
            <b-dropdown id="dropdown-headers" text="Use saved header" class="m-md-2" variant="info">
              <b-dropdown-item v-for="header in headers" :key="header.name" @click="setHeader(header)">{{ header.name }}</b-dropdown-item>
            </b-dropdown>
            <b-badge variant="secondary" href="#" id="headers-tip">
              <b-icon icon="question-circle-fill" aria-label="headers-tip"></b-icon>
            </b-badge>
            <b-popover target="headers-tip" triggers="hover focus">
              <InstructionsHeaders/>
            </b-popover>
          </div>
          <br>
          <b-button-group size="sm">
            <b-button variant="outline-info" @click="addColumn">Add Column</b-button>
            <b-button variant="outline-info" @click="deleteColumn">Delete Column</b-button>
            <b-button v-if="templateType === 'doc'" variant="outline-info" @click="addDataRow">Add row</b-button>
            <b-button v-if="templateType === 'doc'" variant="outline-info" @click="deleteDataRow">Delete row</b-button>
            <b-button v-if="templateType === 'doc'" variant="outline-info" @click="copyLastRow">Copy last row</b-button>
          </b-button-group>
          <br>
          <br>
          <b-button variant="outline-dark" @click="confirmTableReset">Reset Table</b-button>
          <br>
          <br>
          <p class="errorDisplay" v-if="headerCellErrors.length > 0">
            TABLE HEADER ERRORS: Please fix errors in the following cells: {{ headerCellErrors.join(', ') }} 
          </p>
          <p class="errorDisplay" v-if="dataCellErrors.length > 0">
            TABLE CELL SECTION ERRORS: Please fix errors in the following cell sections: {{ dataCellErrors.join(', ') }} 
          </p>
          <b-table-simple striped hover bordered sticky-header responsive>
            <b-thead class="text-center">
              <b-tr>
                <b-th>
                  <b-badge variant="secondary" href="#" id="headerCells-tip">
                    <b-icon icon="question-circle-fill" aria-label="headerCells-tip"></b-icon>
                  </b-badge>
                  <b-popover target="headerCells-tip" triggers="hover focus">
                    <InstructionsHeaderCells/>        
                  </b-popover>
                </b-th>
                <b-th v-for="columnLetter in columnLetters" :key="columnLetter">{{ columnLetter }}</b-th>
              </b-tr>
            </b-thead>  
            <b-tbody>
              <b-tr>
                <b-th class="align-middle">1</b-th>
                <b-td v-for="(headerCell, headerCellIndex) in $v.form.headerCells.$each.$iter" :key=headerCellIndex>
                  <b-form-input
                    v-model="headerCell.value.$model" 
                    :state="validateState(headerCell.value)"
                    placeholder="Header value" 
                    aria-describedby="headerCells-live-feedback"
                  >
                  </b-form-input>
                  <b-form-invalid-feedback id="headerCells-live-feedback">Unique header value required</b-form-invalid-feedback>
                </b-td>
              </b-tr>
              <b-tr v-for="(row, rowIndex) in $v.form.dataRows.$each.$iter" :key="rowIndex">
                <b-th class="align-middle">{{ parseInt(rowIndex, 10) + 2 }}</b-th>
                <b-td v-for="(dataCell, cellIndex) in row.dataCells.$each.$iter" :key="cellIndex">
                  <b-badge  v-if="parseInt(cellIndex, 10) === 0 && parseInt(rowIndex, 10) === 0" variant="secondary" href="#" id="dataCells-tip">
                    <b-icon icon="question-circle-fill" aria-label="dataCells-tip"></b-icon>
                  </b-badge>
                  <b-popover target="dataCells-tip" triggers="hover focus">
                    <InstructionsDataCells/>        
                  </b-popover>
                  <b-button variant="link" size="sm" @click="addCellSect(rowIndex, cellIndex)">Add Section</b-button>
                  <b-button variant="link" size="sm" @click="deleteCellSect(rowIndex, cellIndex)">Delete Section</b-button> 
                  <div v-for="(cellSect, sectIndex) in dataCell.cellSects.$each.$iter" :key="sectIndex">
                    <b-button variant="outline-info" v-b-modal="`modal-${rowIndex}-${cellIndex}-${sectIndex}`">
                      Sect#{{ parseInt(sectIndex, 10) + 1 }}-{{ cellSect.searchOrInputMethod.$model }}-{{ cellSect.phraseOrValue.$model }}
                    </b-button>  
                    <b-modal :id="`modal-${rowIndex}-${cellIndex}-${sectIndex}`" title="Cell section value rules">       
                      <p><strong>Text search and input methods</strong></p>
                      <b-form-group v-slot="{ searchOrInputMethods }">
                        <b-form-radio v-model="cellSect.searchOrInputMethod.$model" :aria-describedby="searchOrInputMethods" value="leftPhrase">
                          Left anchor phrase
                          <b-badge variant="secondary" href="#" id="leftPhrase-tip">
                            <b-icon icon="question-circle-fill" aria-label="leftPhrase-tip"></b-icon>
                          </b-badge>
                          <b-popover target="leftPhrase-tip" triggers="hover focus">
                            <InstructionsLeftPhrase/>        
                          </b-popover>
                        </b-form-radio>
                        <b-form-radio v-model="cellSect.searchOrInputMethod.$model" :aria-describedby="searchOrInputMethods" value="topPhrase">
                          Top anchor phrase
                          <b-badge variant="secondary" href="#" id="topPhrase-tip">
                            <b-icon icon="question-circle-fill" aria-label="topPhrase-tip"></b-icon>
                          </b-badge>
                          <b-popover target="topPhrase-tip" triggers="hover focus">
                            <InstructionsTopPhrase/>        
                          </b-popover>
                        </b-form-radio>                              
                        <b-form-radio v-model="cellSect.searchOrInputMethod.$model" :aria-describedby="searchOrInputMethods" value="pattern">
                          Text pattern
                          <b-badge variant="secondary" href="#" id="textPattern-tip">
                            <b-icon icon="question-circle-fill" aria-label="textPattern-tip"></b-icon>
                          </b-badge>
                          <b-popover target="textPattern-tip" triggers="hover focus">
                            <InstructionsTextPattern/>        
                          </b-popover>
                        </b-form-radio>
                        <b-form-radio v-model="cellSect.searchOrInputMethod.$model" :aria-describedby="searchOrInputMethods" value="customValue">
                          Custom value
                          <b-badge variant="secondary" href="#" id="customValue-tip">
                            <b-icon icon="question-circle-fill" aria-label="customValue-tip"></b-icon>
                          </b-badge>
                          <b-popover target="customValue-tip" triggers="hover focus">
                            <InstructionsCustomValue/>
                          </b-popover>
                        </b-form-radio>           
                        <b-form-radio v-model="cellSect.searchOrInputMethod.$model" :aria-describedby="searchOrInputMethods" value="today" @input="resetCellSect(rowIndex, cellIndex, sectIndex)">
                          Today's date
                          <b-badge variant="secondary" href="#" id="today-tip">
                            <b-icon icon="question-circle-fill" aria-label="today-tip"></b-icon>
                          </b-badge>
                          <b-popover target="today-tip" triggers="hover focus">
                            <InstructionsTodayDate/>
                          </b-popover>
                        </b-form-radio>                                      
                        <b-form-radio v-model="cellSect.searchOrInputMethod.$model" :aria-describedby="searchOrInputMethods" value="" @input="resetCellSect(rowIndex, cellIndex, sectIndex)">
                          Empty cell
                          <b-badge variant="secondary" href="#" id="emptyCell-tip">
                            <b-icon icon="question-circle-fill" aria-label="emptyCell-tip"></b-icon>
                          </b-badge>
                          <b-popover target="emptyCell-tip" triggers="hover focus">
                            <InstructionsEmptySect/>
                          </b-popover>
                        </b-form-radio>                                            
                      </b-form-group>                   
                      <br>
                      <label for="phraseOrValue-input">
                        <strong>Search phrase or literal value </strong>
                        <b-badge variant="secondary" href="#" id="phraseOrValue-tip">
                          <b-icon icon="question-circle-fill" aria-label="phraseOrValue-tip"></b-icon>
                        </b-badge>
                        <b-popover target="phraseOrValue-tip" triggers="hover focus">
                          <InstructionsPhraseOrValue/>
                        </b-popover>
                      </label>             
                      <b-form-group>
                        <b-form-input 
                          id="phraseOrValue-input"
                          placeholder="Enter phrase or value" 
                          v-model="cellSect.phraseOrValue.$model" 
                          :state="validateState(cellSect.phraseOrValue)" 
                          aria-describedby="phraseOrValue-live-feedback"
                          :disabled="!cellSect.searchOrInputMethod.$model || cellSect.searchOrInputMethod.$model === 'today'"
                        >
                        </b-form-input>
                        <b-form-invalid-feedback id="phraseOrValue-live-feedback">Please enter phrase or value</b-form-invalid-feedback>
                      </b-form-group>
                      <br>
                      <label for="appendChars-input">
                        (Optional)<strong> Append characters </strong>
                        <b-badge variant="secondary" href="#" id="appendChars-tip">
                          <b-icon icon="question-circle-fill" aria-label="appendChars-tip"></b-icon>
                        </b-badge>
                        <b-popover target="appendChars-tip" triggers="hover focus">
                          <InstructionsAppendChars/>
                        </b-popover>
                      </label>             
                      <b-form-group>
                        <b-form-input 
                          id="appendChars-input"
                          placeholder="Enter characters, including spaces" 
                          v-model="cellSect.appendChars.$model" 
                          :state="validateState(cellSect.appendChars)" 
                          :disabled="!cellSect.searchOrInputMethod.$model"
                        >
                        </b-form-input>
                        <pre>Appended characters: "{{ cellSect.appendChars.$model }}"</pre> 
                      </b-form-group>
                      <br>
                      <label for="formatDate-input">
                        (Optional)<strong> Format date </strong>
                        <b-badge variant="secondary" href="#" id="formatDate-tip">
                          <b-icon icon="question-circle-fill" aria-label="formatDate-tip"></b-icon>
                        </b-badge>
                        <b-popover target="formatDate-tip" triggers="hover focus">
                          <InstructionsFormatDate/>
                        </b-popover>
                      </label>             
                      <b-form-group>
                        <b-form-input 
                          id="formatDate-input"
                          placeholder="M D Y - , / and spaces allowed"
                          v-model="cellSect.dateFormat.$model" 
                          :state="validateState(cellSect.dateFormat)" 
                          aria-describedby="dateFormat-live-feedback"
                          :disabled="!cellSect.searchOrInputMethod.$model"
                        >
                        </b-form-input>
                        <b-form-invalid-feedback id="dateFormat-live-feedback">Invalid date format</b-form-invalid-feedback>
                      </b-form-group>
                      <br>
                      <div>
                        <label for="sb-inline">
                          (Optional)<strong> Add days to date (0-99) </strong>
                          <b-badge variant="secondary" href="#" id="addDays-tip">
                            <b-icon icon="question-circle-fill" aria-label="addDays-tip"></b-icon>
                          </b-badge>
                          <b-popover target="addDays-tip" triggers="hover focus">
                            <InstructionsAddDays/>
                          </b-popover>
                        </label>
                        <br>
                        <b-form-spinbutton 
                          id="sb-inline" 
                          min="0" 
                          max="99" 
                          step="1" 
                          v-model="cellSect.daysAdded.$model" 
                          inline
                          :disabled="!cellSect.searchOrInputMethod.$model"
                        >
                        </b-form-spinbutton>
                      </div>
                    </b-modal>
                  </div> 
                </b-td>
              </b-tr>
            </b-tbody>
          </b-table-simple>
          <b-button type="submit" variant="primary" @click="postError = ''">Submit</b-button>
        </b-form>
        <template #footer>
          <b-link :to="`/index/${templateType}`">Back to {{ templateType }}s</b-link>
        </template>
      </b-card>
    </div>
  </div>
</template>          


<script>
import axios from 'axios'
import Navbar from '../components/Navbar.vue'
import InstructionsDocID from '../components/InstructionsDocID.vue'
import InstructionsHeaders from '../components/InstructionsHeaders.vue'
import InstructionsHeaderCells from '../components/InstructionsHeaderCells.vue'
import InstructionsDataCells from '../components/InstructionsDataCells.vue'
import InstructionsLeftPhrase from '../components/InstructionsLeftPhrase.vue'
import InstructionsTopPhrase from '../components/InstructionsTopPhrase.vue'
import InstructionsTextPattern from '../components/InstructionsTextPattern.vue'
import InstructionsCustomValue from '../components/InstructionsCustomValue.vue'
import InstructionsTodayDate from '../components/InstructionsTodayDate.vue'
import InstructionsEmptySect from '../components/InstructionsEmptySect.vue'
import InstructionsPhraseOrValue from '../components/InstructionsPhraseOrValue.vue'
import InstructionsAppendChars from '../components/InstructionsAppendChars.vue'
import InstructionsFormatDate from '../components/InstructionsFormatDate.vue'
import InstructionsAddDays from '../components/InstructionsAddDays.vue'
import { errorHandler } from '../util/errors'
import { validationMixin } from 'vuelidate'
import { required, requiredIf	} from 'vuelidate/lib/validators'
import { isUniqueHeaderCellValue, areValidDateChars, isDocTemplate, notEmptyValueOrToday } from '../util/validators'


export default {
  name: 'Template',
  components: {
    Navbar,
    InstructionsDocID,
    InstructionsHeaders,
    InstructionsHeaderCells,
    InstructionsDataCells,
    InstructionsLeftPhrase,
    InstructionsTopPhrase,
    InstructionsTextPattern,
    InstructionsCustomValue,
    InstructionsTodayDate,
    InstructionsEmptySect,
    InstructionsPhraseOrValue,
    InstructionsAppendChars,
    InstructionsFormatDate,
    InstructionsAddDays
  },
  mixins: [validationMixin],
  props: [
    'templateType',
    'id'
  ],
  data() {
    return {
      form: {
        name: '',
        idPhrase: '',
        idPhrase2: '',
        headerCells: [],
        dataRows: [],
      },
      columnLetters: [],
      headers: [],
      headerCellErrors: [],
      dataCellErrors: [],
      isLoading: false,
      postError: ''
    }
  },
  validations: {
    form: {
      name: {
        required, 
      },
      idPhrase: {
        required: requiredIf(isDocTemplate) 
      },
      idPhrase2: {},
      headerCells: {
        $each: {
          value: {
            required,
            isUniqueHeaderCellValue
          }
        }
      },
      dataRows: {
        $each: {
          dataCells: {
            $each: {
              cellSects: {
                $each: {
                  searchOrInputMethod: {},
                  phraseOrValue: {
                    required: requiredIf(notEmptyValueOrToday)
                  },
                  appendChars: {},
                  dateFormat: {
                    areValidDateChars
                  },
                  daysAdded: {}
                }
              }
            }
          }
        }
      }
    }
  },
  methods: {

    validateState(field) {
      const { $dirty, $error } = field;
      return $dirty ? !$error : null;
    },

    //Display that helps user to quickly find which table header cells contain errors
    displayheaderCellErrors() {
      this.headerCellErrors = []
      for (const i in this.$v.form.headerCells.$each.$iter) {
        if (this.$v.form.headerCells.$each.$iter[i].$anyError) {
          this.headerCellErrors.push(this.columnLetters[parseInt(i, 10)] + '1')
        }
      }
    },

    //Helps user to quickly find which table data cells contain errors
    displayDataCellErrors() {
      this.dataCellErrors = []
      for (const x in this.$v.form.dataRows.$each.$iter) {
        for (const y in this.$v.form.dataRows.$each.$iter[x].dataCells.$each.$iter) {
           for (const z in this.$v.form.dataRows.$each.$iter[x].dataCells.$each.$iter[y].cellSects.$each.$iter) {
              if (this.$v.form.dataRows.$each.$iter[x].dataCells.$each.$iter[y].cellSects.$each.$iter[z].$anyError) {
                this.dataCellErrors.push(`${this.columnLetters[parseInt(y, 10) % 52]}${parseInt(x, 10) + 2}-Section ${parseInt(z, 10) + 1}`)
              }
           }
        }
      }
    },
    
    resetErrorDisplay() {
      this.headerCellErrors = []
      this.dataCellErrors = []
    },
    

    //TABLE METHODS

    addColumnLetter() {
      if (this.columnLetters.length < 52) {
        let referenceLetter = this.columnLetters[this.columnLetters.length - 1]
        let nextColumnLetter = ''
        if (!referenceLetter) { 
          nextColumnLetter = 'A'
        } else if (referenceLetter === 'Z') { 
          nextColumnLetter = 'AA'
        } else if (referenceLetter.length === 1) {
          nextColumnLetter = String.fromCharCode(referenceLetter.charCodeAt(referenceLetter.length - 1) + 1)
        } else { 
          nextColumnLetter = 'A' + String.fromCharCode(referenceLetter.charCodeAt(referenceLetter.length - 1) + 1)
        }  
        this.columnLetters.push(nextColumnLetter)
      } 
    },

    deleteColumnLetter() {
      this.columnLetters.pop()
      if (!this.columnLetters.length) {
        this.addColumnLetter()
      }
    },

    resetColumnLetters() {
      this.columnLetters = []
      // eslint-disable-next-line no-unused-vars
      this.form.headerCells.forEach(cell => {
        this.addColumnLetter()
      });
    },

    addHeaderCell(cell) { 
      if (this.form.headerCells.length < 52) {
        this.form.headerCells.push(cell)
      }
    },

    deleteHeaderCell() { 
      this.form.headerCells.pop()
      if (!this.form.headerCells.length) {
        this.addHeaderCell({ value: '' })
        this.$nextTick(() => {
          this.$v.form.headerCells.$reset()
        })
      }
    },

    resetHeaderCells() { 
      this.form.headerCells = []
      this.addHeaderCell({ value: '' }) 
      this.$nextTick(() => {
        this.$v.form.headerCells.$reset()
      })
    },

    addCellSect(rowIndex, cellIndex) {
      const cellSects = this.form.dataRows[rowIndex].dataCells[cellIndex].cellSects
      const emptySect = {
        searchOrInputMethod: '', 
        phraseOrValue: '',  
        appendChars: '',
        dateFormat: '',
        daysAdded: 0
      }
      //do not add another sect if current sect has 'Empty cell' selected
      const currentSect = cellSects[cellSects.length - 1]
      if (currentSect && !currentSect.searchOrInputMethod) {
        return
      }
      if (cellSects.length < 4) {
        cellSects.push(emptySect)
      }
    },

    deleteCellSect(rowIndex, cellIndex) {
      const cellSects = this.form.dataRows[rowIndex].dataCells[cellIndex].cellSects
      cellSects.pop()
      if (!cellSects.length) {
        this.addCellSect(rowIndex, cellIndex) 
        this.$nextTick(() => {
          this.$v.form.dataRows.$each.$iter[rowIndex].dataCells.$each.$iter[cellIndex].cellSects.$reset()
        })
      }
    },

    resetCellSect(rowIndex, cellIndex, sectIndex) {
      const sect = this.$v.form.dataRows.$each.$iter[rowIndex].dataCells.$each.$iter[cellIndex].cellSects.$each.$iter[sectIndex]
      if (!sect.searchOrInputMethod.$model) {
        sect.phraseOrValue.$model = ''
        sect.appendChars.$model = ''
        sect.dateFormat.$model = ''
        sect.daysAdded.$model = 0
        sect.$reset()
      } else if (sect.searchOrInputMethod.$model === 'today') {
        sect.phraseOrValue.$model = ''
        sect.phraseOrValue.$reset()
      }
    },

    addDataCell(rowIndex) { 
      const dataCells = this.form.dataRows[rowIndex].dataCells
      if (dataCells.length < 52) {
        dataCells.push({ cellSects: [] })
        this.addCellSect(rowIndex, dataCells.length - 1)
      }
    },

    addDataRow() { 
      if (this.form.dataRows.length < 100) {
        this.form.dataRows.push({ dataCells: [] })
        // eslint-disable-next-line no-unused-vars
        this.form.headerCells.forEach(cell => {
          this.addDataCell(this.form.dataRows.length - 1)
        })
      }
    },

    deleteDataRow() {
      this.form.dataRows.pop()
      if (!this.form.dataRows.length) {
        this.addDataRow()
        this.$nextTick(() => {
          this.$v.form.dataRows.$reset()
        })          
      }
    },

    addColumn() {
      this.addHeaderCell({ value: '' }) 
      this.addColumnLetter()
      if (this.templateType === 'doc') {
        // eslint-disable-next-line no-unused-vars
        this.form.dataRows.forEach((row, index) => {
          this.addDataCell(index)
        })
      }
    },

    deleteColumn() {
      this.deleteHeaderCell()
      this.deleteColumnLetter()
      if (this.templateType === 'doc') {
        this.form.dataRows.forEach(row => {
          row.dataCells.pop()
        })
        if (!this.form.dataRows[0].dataCells.length) {
          this.resetDataRows()
        }
      }
    },

    copyLastRow() {
      const rowToCopy = this.form.dataRows[this.form.dataRows.length - 1]
      const newRow = JSON.parse(JSON.stringify(rowToCopy))
      delete newRow._id
      newRow.dataCells.forEach(dataCell => {
        dataCell.cellSects.forEach(cellSect => {
          delete cellSect['_id']
        });
        delete dataCell['_id']
      })
      this.form.dataRows.push(newRow)
    },
        
    resetDataRows() { 
      this.form.dataRows = []
      this.addDataRow()
      this.$nextTick(() => {
        this.$v.form.dataRows.$reset()
      })      
    },

    resetTable() {
      this.resetHeaderCells()
      this.resetColumnLetters()
      if (this.templateType === 'doc') {
        this.resetDataRows()
      }
      this.resetErrorDisplay()
    },

    confirmTableReset() {
      if (confirm('This will clear all data in the current table. Ok to proceed?')) {
        this.resetTable()
      } else {
        return
      }
    },


    //Select a saved header
    setHeader(header) {
      if (confirm('Selecting this header will clear all cell section data in the current table. Ok to proceed?')) {
        this.form.headerCells = header.cells
        this.resetColumnLetters()
        this.resetDataRows()
        this.resetErrorDisplay()
      } else {
        return
      }
    },


    //HTTP REQUEST HELPERS

    //Makes sure all of the default properties are defined within any existing data cell sects after doc loads, to enable form input binding.
    //Some of these cell sect properties would otherwise be undefined after doc loads, since cell sect properties with empty values are not saved to the db
    defineAllCellSectValues(dataRows) {
      const emptySect = {
        searchOrInputMethod: '', 
        phraseOrValue: '',  
        appendChars: '',
        dateFormat: '',
        daysAdded: 0
      }
      dataRows.forEach(row => {
        row.dataCells.forEach(cell => {
          cell.cellSects.forEach(sect => {
            for (let prop in emptySect) {
              if (!sect[prop]) {
                sect[prop] = emptySect[prop]
              }
            }
          })
        })
      })
      return dataRows
    },

    //Removes cell sect properties containing empty values before saving doc to db, in order to save db space
    removeFalsyValuesFromDataRows() {
      this.form.dataRows.forEach(row => {
        row.dataCells.forEach(cell => {
          cell.cellSects.forEach(sect => {
            for (let prop in sect) {
              if (!sect[prop]) {
                delete sect[prop]  
              }
            }
          })
        })
      })
    },

    //error handler for the below HTTP requests
    handleFetchError(err) {
      const errInfo = errorHandler(err)
      if (errInfo.status === 401) {
        this.$router.push({ name: 'Login', params: { msg: { text: errInfo.message, context: 'danger' }}})
      } else if (errInfo.message.includes('The same value already exists for the following field:')) {
        this.isLoading = false
        this.postError = errInfo.message
      } else {
        this.$router.push({ name: 'Index', params: { templateType: this.templateType, msg: { text: errInfo.message, context: 'danger' }}})
      }
    },

  
    //HTTP REQUESTS

    async getTemplate() {
      this.isLoading = true
      const res = await axios.get(`/api/${this.templateType}s/${this.id}`)
      this.form.name = res.data.name
      if (this.templateType === 'header') {
        this.form.headerCells = res.data.cells
      } else {
        this.form.idPhrase = res.data.idPhrase
        this.form.idPhrase2 = res.data.idPhrase2
        this.form.headerCells = res.data.header
        this.form.dataRows = this.defineAllCellSectValues(res.data.dataRows)
      }
      this.isLoading = false
    },

    async getHeaders() {
      this.isLoading = true
      const res = await axios.get('/api/headers/')
      this.headers = res.data
      this.isLoading = false
    },

    async postTemplate() {
      if (this.templateType === 'header') {
        await axios.post('/api/headers/', { name: this.form.name, cells: this.form.headerCells })
      } else {
        this.removeFalsyValuesFromDataRows()
        await axios.post('/api/docs/', { 
          name: this.form.name, 
          idPhrase: this.form.idPhrase, 
          idPhrase2: this.form.idPhrase2, 
          header: this.form.headerCells, 
          dataRows: this.form.dataRows 
          })         
      }
      this.$router.push({ name: 'Index', params: { templateType: this.templateType, msg: { text: `${this.form.name} successfully added`, context: 'success' }}})
    },

    async editTemplate(id) {
      if (this.templateType === 'header') { 
        await axios.put(`/api/headers/${id}`, { name: this.form.name, cells: this.form.headerCells })
      } else {
        this.removeFalsyValuesFromDataRows()
        await axios.put(`/api/docs/${id}`, { 
          name: this.form.name, 
          idPhrase: this.form.idPhrase, 
          idPhrase2: this.form.idPhrase2, 
          header: this.form.headerCells, 
          dataRows: this.form.dataRows })         
      }
      this.$router.push({ name: 'Index', params: { templateType: this.templateType, msg: { text: `${this.form.name} successfully updated`, context: 'success' }}})
    },
  
    async submitTemplate() {
      this.$v.form.$touch()
      if (!this.$v.form.$anyError) {
        this.isLoading = true
        this.resetErrorDisplay()
        try {
          if (this.id) {
            await this.editTemplate(this.id)
          } else {
            await this.postTemplate()
          }
        } catch (err) {
          this.handleFetchError(err)
        }
      } else {
        this.displayheaderCellErrors()
        this.displayDataCellErrors()
      }
    },
      
    async getPageData() {
      this.form.name = ''
      this.form.idPhrase = ''
      this.form.idPhrase2 = ''
      this.form.dataRows = []
      try {
        if (this.id) {
          await this.getTemplate()
        } else {
          this.resetHeaderCells()
          if (this.templateType === 'doc') {
            this.resetDataRows()
          }
        }
        this.resetColumnLetters()
        await this.getHeaders()
      } catch (err) {
        this.handleFetchError(err)
      }
    }   
  },
  async mounted() {
    await this.getPageData()
  },
  watch: {
    async $route() {
      await this.getPageData()
    }
  } 
}
</script>

 
<style>

.errorDisplay {
  color: red;
}

.table {
  width: 0%;
}

td {
  min-width: 149px;
}

.popover-body {
  height: 150px;
  overflow-y: auto;
}

</style>