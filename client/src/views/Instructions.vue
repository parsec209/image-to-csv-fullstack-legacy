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
        <p> In order to extract text variables across a set of similar documents, such as metadata values, the application needs some sort of text constants within 
          these documents as a starting point. The two text constants this application can look for in a document are <i>anchor phrases</i> and <i>text patterns</i>. 
          Anchor phrases, which can be field names like "Invoice #" or "PO Number", are expected to be in the same relative 
          position to the metadata values in each subsequent document. A text pattern is found within the metadata value itself (i.e. you know the value will be a ten digit number 
          in each subsequent document). When you receive a set of documents regularly that contain such 
          constants, it can be setup as a <strong>recurring document</strong>. A recurring doc is a set of rules you configure that tells the 
          application what text constants to look for in order to extract your desired metadata values. A recurring doc also specifies where and how you want the 
          extracted metadata and field names to appear in the generated CSV file.
          <br>
          <br>
          You can add, edit, and delete recurring documents in the <b-link to="/index/doc">My recurring documents</b-link> page. This will be the starting point if this is your
          first time using the application. 
          <br>
          <br>
          The list below includes instructions for individual sections of a recurring document setup page, as well as for the file upload page. For your convenience, 
          many parts of these instructions are also embedded in the actual pages, just look for any question mark icons.
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
            <p>The <strong>text search and input methods</strong> within each cell section are as follows:</p>
            <b-button v-b-toggle.doc-body-cellSect-rules-searchInput-leftPhrase-guide  variant="link">Left anchor phrase</b-button>
            <b-collapse id="doc-body-cellSect-rules-searchInput-leftPhrase-guide" class="mt-2">
              <b-card>
                <InstructionsLeftPhrase/>
              </b-card>
            </b-collapse>
            <br>
            <b-button v-b-toggle.doc-body-cellSect-rules-searchInput-topPhrase-guide  variant="link">Top anchor phrase</b-button>
            <b-collapse id="doc-body-cellSect-rules-searchInput-topPhrase-guide" class="mt-2">
              <b-card>
                <InstructionsTopPhrase/>
              </b-card>
            </b-collapse>
            <br>
            <b-button v-b-toggle.doc-body-cellSect-rules-searchInput-textPattern-guide  variant="link">Text pattern</b-button>
            <b-collapse id="doc-body-cellSect-rules-searchInput-textPattern-guide" class="mt-2">
              <b-card>
                <InstructionsTextPattern/>
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
            <InstructionsPhraseOrValue/> 
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
import InstructionsUploads from '../components/InstructionsUploads.vue'


export default {
  name: 'Instructions',
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