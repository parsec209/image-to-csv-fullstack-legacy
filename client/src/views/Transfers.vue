<template>
  <div>
    <Navbar/>
    <br>
    <div class="container"> 
      <br>
      <b-row>
        <b-col md="6" offset-md="3">
          <b-card bg-variant="light">
            <div class="text-center">
              <b-button variant="info" class="mr-1" to="/index/header">
                My Headers
              </b-button>
              <b-button variant="info" to="/index/doc">
                My Recurring Docs
              </b-button>
            </div>
            <br>
            <br>
            <b-form @submit.prevent="getCSV">
              <b-form-group>
                <b-badge variant="secondary" href="#" id="upload-tip">
                  <b-icon icon="question-circle-fill" aria-label="upload-tip"></b-icon>
                </b-badge>
                <b-popover target="upload-tip" triggers="hover focus">
                  <InstructionsUploads/>        
                </b-popover>
                <b-form-input 
                  placeholder="Enter up to five pages to scan (e.g. 1, 3, -1, -2)"
                  v-model="$v.form.pageSelections.$model" 
                  :state="validateState('pageSelections')"
                  aria-describedby="pageSelections-live-feedback"
                  :disabled="isProcessing"
                >
                </b-form-input>
                <b-form-invalid-feedback id="pageSelections-live-feedback">Invalid format or range</b-form-invalid-feedback>
              </b-form-group>
              <br>
              <b-form-group>
                <b-form-file
                  id="file-input"
                  placeholder="Select up to ten files, 10MB max per file"
                  v-model="$v.form.files.$model" 
                  accept=".TIF, .tiff, .gif, .pdf"
                  :state="validateState('files')"
                  :file-name-formatter="formatNames"
                  multiple
                  aria-describedby="files-live-feedback"
                  @input="statusMsgs = []"
                  :disabled="isProcessing"
                >
                </b-form-file>
                <b-form-invalid-feedback id="files-live-feedback">Invalid file size or number of files</b-form-invalid-feedback>
              </b-form-group>
              <b-button class="my-2" variant="secondary" @click="resetFiles" :disabled="isProcessing">Reset</b-button>
              <p class="mb-1" v-for="file in form.files" :key="file.name"> 
                {{ file.name + ', ' + getFileSize(file.size) }}
              </p>
              <br>
              <div class="text-center">
                <div v-if="isProcessing" class="mb-2">
                  <b-spinner variant="secondary" label="Loading"></b-spinner>
                </div>   
                <b-alert show v-for="statusMsg in statusMsgs" :key="statusMsg.text" :variant="statusMsg.context">
                  {{ statusMsg.text }}
                </b-alert>
              </div>
              <br>
              <div class="text-center">
                <b-button block type="submit" variant="primary" size="lg" @click="statusMsgs = []" :disabled="isProcessing">Get CSV</b-button>
              </div>
            </b-form>
          </b-card>
        </b-col>
      </b-row>
    </div>
  </div>
</template>


<script>
import axios from 'axios'
import Navbar from '../components/Navbar.vue'
import InstructionsUploads from '../components/InstructionsUploads.vue'
import { errorHandler } from '../util/errors'
import { validationMixin } from 'vuelidate'
import { required, maxLength, maxValue } from 'vuelidate/lib/validators'
import { isValidPageFormat } from '../util/validators'


export default {
  name: 'Transfers',
  components: {
    Navbar,
    InstructionsUploads
  },
  mixins: [validationMixin],
  data() {
    return {
      form: {
        pageSelections: '',
        files: null
      }, 
      statusMsgs: [],
      isProcessing: false
    }
  },
  validations: {
    form: {
      pageSelections: {
        required, 
        isValidPageFormat
      },
      files: { 
        required,
        maxLength: maxLength(10),
        $each: {
          size: {
            maxValue: maxValue(10 * 1024 * 1024)
          }
        }
      }
    }
  },
  methods: {

    validateState(field) {
      const { $dirty, $error } = this.$v.form[field];
      return $dirty ? !$error : null;
    },

    //displays number of files selected inside the file picker
    formatNames(files) {
      return files.length === 1 ? `${files.length} file selected` : `${files.length} files selected`
    },

    //displays file size in KB or MB
    getFileSize(number) {
      if (number < 1024) {
        return number + 'bytes'
      } else if (number >= 1024 && number < 1048576) {
        return (number/1024).toFixed(1) + 'KB';
      } else if (number >= 1048576) {
        return (number/1048576).toFixed(1) + 'MB';
      }
    },

    //clears selected files and status messages 
    resetFiles() {
      this.form.files = null;
      this.$nextTick(() => {
        this.$v.form.files.$reset()
      })
      this.statusMsgs = []
    },
  
    //gets user's browser date, used when user selects "today" as a cell section input method 
    getDateToday() {
      let today = new Date()
      let DD = String(today.getDate()).padStart(2, '0')
      let MM = String(today.getMonth() + 1).padStart(2, '0'); //January is 0
      let YYYY = today.getFullYear()
      today = YYYY + '/' + MM + '/' + DD
      return today
    },
    

    //HTTP REQUESTS

    //upload files to cloud storage
    async upload() {
      const formData = new FormData();
      this.form.files.forEach(file => {
        formData.append('myFiles', file);
      })
      const res = await axios.post('/api/transfers/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }})
      const fileBatchID = res.data
      return fileBatchID
    },

    //extract text from uploads and write CSV files from the data
    async extractText(fileBatchID) {
      const res = await axios.post('/api/transfers/extract', 
        {
          fileBatchID,
          pageSelections: this.form.pageSelections.length <=3 ? [parseInt(this.form.pageSelections, 10)] : this.form.pageSelections.split(', ').map(page => parseInt(page, 10)),
          dateToday: this.getDateToday()
        }
      )
      const { identifiedDocs, unidentifiedDocs } = res.data
      if (!identifiedDocs.length) {
        throw new Error('No uploads were recognized as recurring docs')
      } else {
        identifiedDocs.forEach(doc => {
          this.statusMsgs.push({ text: `Data retrieved from ${doc}`, context: 'success' })
        })
        unidentifiedDocs.forEach(doc => {
          this.statusMsgs.push({ text: `Unable to recognize ${doc} as a recurring doc`, context: 'warning' })
        })
      }
    },

    //combine all CSV files into one zip file
    async writeZip(fileBatchID) {
      const res = await axios.post('/api/transfers/write', { fileBatchID })
      return res.data
    },

    //automatically download the zip file once its ready
    download(url) {
      const fileLink = document.createElement('a')
      fileLink.href = url;
      fileLink.setAttribute('download', 'download');
      document.body.appendChild(fileLink);
      fileLink.click();
    },

    //central request that combines the requests above, also displaying status of requests step by step to user
    async getCSV() { 
      this.$v.form.$touch();
      if (!this.$v.form.$anyError) {
        this.isProcessing = true
        try {
          this.statusMsgs.push({ text: 'Step 1 of 4: Uploading files...', context: 'info' })
          const fileBatchID = await this.upload()
          this.statusMsgs.push({ text: 'Step 2 of 4: Getting CSV data...', context: 'info' })
          await this.extractText(fileBatchID);
          this.statusMsgs.push({ text: 'Step 3 of 4: Writing Zip file...', context: 'info' })
          const zipURL = await this.writeZip(fileBatchID);
          this.statusMsgs.push({ text: 'Step 4 of 4: Standby for download', context: 'success' })
          this.download(zipURL)
          this.isProcessing = false
        } catch (err) {
          const errInfo = errorHandler(err)
          if (errInfo.status === 401) {
            this.$router.push({ name: 'Login', params: { msg: { text: errInfo.message, context: 'danger' }}})
          } else {
            this.statusMsgs.push({ text: `PROCESS ABORTED: ${errInfo.message}`, context: 'danger' });
            this.isProcessing = false
          }
        }
      } 
    }
  }
}
</script>






