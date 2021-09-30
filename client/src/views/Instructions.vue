<template>
  <div>
    <Navbar/>
    <br>
    <div class="container">
      <br>
      <b-card header-tag="header" footer-tag="footer">
        <template #header>
          <div class="text-center">  
            <h3>Instructions</h3>
          </div>
        </template>
        <br>
        <p>This application generates CSV files from uploaded image files via the following steps:</p>
        <br>
        <ol>
          <li>Performs OCR on a batch of image files</li>
          <li>Gathers all of the relevant metadata from the extracted text</li>
          <li>Places the metadata into specific records and fields of a CSV file</li>
          <li>Outputs the CSV file for download</li>
        </ol>  
        <br>      
        <p>For each type of similarly-formatted document, called a <i>recurring document</i>, the user specifies a set of rules that enables the application
          to recognize an upload as one of its recurring documents, extract specific text from this document, and then place the metadata into 
          specific records/fields of a generated CSV file. The ideal candidate for a recurring document is one that is
          received regularly (i.e. a specific invoice from a vendor) and that has predictable characteristics in its text and formatting each time it is received. 
          In general, the only thing that should really change between each recurring document is the metadata values you need for the CSV file (i.e. invoice number, balance due, etc.).
          The use of <i>anchor phrases</i> (i.e. getting a value located next to a field name in an image) and <i>regular expressions</i> (predictable text patterns) are the two
          text retrieval methods this application uses, and there is also the option to have CSV fields contain values not found in the text, such as a user-specified input
          or today's date. Additional features can be added to the values, such as date formatting (if the value is recognized as a date), adding days to a date, 
          or character appendage to the end of a value. Lastly, there is the flexibility to combine multiple pieces of metadata together into a single CSV field. For example,
          you can use one rule for retrieving a statement number and another rule for the statement date, and combine these two values together into a single CSV field with a hyphen
          in between them (using the character appendage feature previously mentioned).
        </p>
        <br>
        <p> You can add, edit, and delete recurring documents in the <b-link to="/index/doc">My recurring documents</b-link> page. This will be the starting point if this is your
          first time using the application. 
          <br>
          <br>
          The list below includes instructions for individual sections of a recurring document setup page, as well as for the file upload page. For your convenience, 
          many parts of these instructions are also embedded in the actual pages, just look for the question mark icons.
        </p>
        <b-icon icon="file-earmark-text"></b-icon>
        <b-button v-b-toggle.doc-IDPhrase-guide variant="link">Recurring document ID phrase</b-button>
        <b-collapse id="doc-IDPhrase-guide" class="mt-2">
          <b-card>
            <InstructionsDocID/>
          </b-card>
        </b-collapse>
        <br>
        <b-icon icon="file-earmark-text"></b-icon>
        <b-button v-b-toggle.doc-savedHeaders-guide variant="link">Saved headers</b-button>
        <b-collapse id="doc-savedHeaders-guide" class="mt-2">
          <b-card>
            <InstructionsHeaders/>
          </b-card>
        </b-collapse>
        <br>
        <b-icon icon="file-earmark-text"></b-icon>
        <b-button v-b-toggle.doc-table-header-guide variant="link">Table header row</b-button>
        <b-collapse id="doc-table-header-guide" class="mt-2">
          <b-card>
            <InstructionsHeaderCells/>
          </b-card>
        </b-collapse>
        <br>
        <b-icon icon="file-earmark-text"></b-icon>
        <b-button v-b-toggle.doc-table-body-guide variant="link">Table data rows</b-button>
        <b-collapse id="doc-table-body-guide" class="mt-2">
          <b-card>
            <InstructionsDataCells/>
            <br>
            <p>The <strong>string search methods</strong> within each cell section are as follows:</p>
            <b-button v-b-toggle.doc-body-cellSect-rules-searchInput-leftPhrase-guide  variant="link">Anchor phrase - horizontal search</b-button>
            <b-collapse id="doc-body-cellSect-rules-searchInput-leftPhrase-guide" class="mt-2">
              <b-card>
                <InstructionsAnchorHoriz/>
              </b-card>
            </b-collapse>
            <br>
            <b-button v-b-toggle.doc-body-cellSect-rules-searchInput-topPhrase-guide  variant="link">Anchor phrase - vertical search</b-button>
            <b-collapse id="doc-body-cellSect-rules-searchInput-topPhrase-guide" class="mt-2">
              <b-card>
                <InstructionsAnchorVert/>
              </b-card>
            </b-collapse>
            <br>
            <b-button v-b-toggle.doc-body-cellSect-rules-searchInput-textPattern-guide  variant="link">Regular Expression</b-button>
            <b-collapse id="doc-body-cellSect-rules-searchInput-textPattern-guide" class="mt-2">
              <b-card>
                <InstructionsRegExp/>
              </b-card>
            </b-collapse>
            <br>
            <b-button v-b-toggle.doc-body-cellSect-rules-searchInput-customValue-guide  variant="link">Custom value</b-button>
            <b-collapse id="doc-body-cellSect-rules-searchInput-customValue-guide" class="mt-2">
              <b-card>
                <InstructionsCustomValue/>                           
              </b-card>
            </b-collapse>
            <br>
            <b-button v-b-toggle.doc-body-cellSect-rules-searchInput-today-guide  variant="link">Today's date</b-button>
            <b-collapse id="doc-body-cellSect-rules-searchInput-today-guide" class="mt-2">
              <b-card>                            
                <InstructionsTodayDate/>                            
              </b-card>
            </b-collapse>
            <br>
            <b-button v-b-toggle.doc-body-cellSect-rules-searchInput-empty-guide  variant="link">Empty cell</b-button>
            <b-collapse id="doc-body-cellSect-rules-searchInput-empty-guide" class="mt-2">
              <b-card>                              
                <InstructionsEmptySect/>                             
              </b-card>
            </b-collapse>
            <br>
            <br>
            <InstructionsSearchString/> 
            <br>        
            <InstructionsStringRetrievalType/> 
            <br>
            <br>        
            <InstructionsStringCount/> 
            <br>        
            <InstructionsAppendChars/> 
            <br>
            <InstructionsFormatDate/> 
            <br>
            <InstructionsAddDays/> 
          </b-card>
        </b-collapse>
        <br>
        <b-icon icon="file-earmark-text"></b-icon>
        <b-button v-b-toggle.uploads-guide variant="link">Uploading files to generate a CSV</b-button>
        <b-collapse id="uploads-guide" class="mt-2">
          <b-card>
            <InstructionsUploads/>
          </b-card>
        </b-collapse>
      </b-card>
    </div> 
  </div>
</template>


<script>
import Navbar from '../components/Navbar.vue'
import InstructionsDocID from '../components/InstructionsDocID.vue'
import InstructionsHeaders from '../components/InstructionsHeaders.vue'
import InstructionsHeaderCells from '../components/InstructionsHeaderCells.vue'
import InstructionsDataCells from '../components/InstructionsDataCells.vue'
import InstructionsAnchorHoriz from '../components/InstructionsAnchorHoriz.vue'
import InstructionsAnchorVert from '../components/InstructionsAnchorVert.vue'
import InstructionsRegExp from '../components/InstructionsRegExp.vue'
import InstructionsCustomValue from '../components/InstructionsCustomValue.vue'
import InstructionsTodayDate from '../components/InstructionsTodayDate.vue'
import InstructionsEmptySect from '../components/InstructionsEmptySect.vue'
import InstructionsSearchString from '../components/InstructionsSearchString.vue'
import InstructionsStringRetrievalType from '../components/InstructionsStringRetrievalType.vue'
import InstructionsStringCount from '../components/InstructionsStringCount.vue'
import InstructionsAppendChars from '../components/InstructionsAppendChars.vue'
import InstructionsFormatDate from '../components/InstructionsFormatDate.vue'
import InstructionsAddDays from '../components/InstructionsAddDays.vue'
import InstructionsUploads from '../components/InstructionsUploads.vue'


export default {
  name: 'Instructions',
  components: {
    Navbar,
    InstructionsDocID,
    InstructionsHeaders,
    InstructionsHeaderCells,
    InstructionsDataCells,
    InstructionsAnchorHoriz,
    InstructionsAnchorVert,
    InstructionsRegExp,
    InstructionsCustomValue,
    InstructionsTodayDate,
    InstructionsEmptySect,
    InstructionsSearchString,
    InstructionsStringRetrievalType,
    InstructionsStringCount,
    InstructionsAppendChars,
    InstructionsFormatDate,
    InstructionsAddDays,
    InstructionsUploads
  }
}
</script>


<style scoped>

.card-header {
  border-bottom: none;
}

.card-footer {
  border-top: none
}

</style>