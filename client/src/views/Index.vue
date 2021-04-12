<template>
  <div>
    <Navbar/>
    <div class="container"> 
      <br>
      <br>
      <b-row>
        <b-col md="6" offset-md="3">
          <div class="text-center">
            <b-alert :show="loadError.length > 0" variant="danger">{{ loadError }}</b-alert>
            <b-alert :show="Object.keys(postStatus).length > 0 && loadError.length === 0" :variant="postStatus.context">{{ postStatus.text }}</b-alert>
            <div v-if="isLoading">
              <b-spinner variant="secondary" label="Loading"></b-spinner>
            </div>   
          </div>
          <br>
          <b-button block variant="info" size="lg" :to="`/${templateType}`">Add {{ templateType === 'doc' ? 'recurring document' : 'header' }}</b-button>
          <br>
          <b-list-group>
            <b-list-group-item class="text-center" v-if="!templates.length">No {{ templateType }}s added yet</b-list-group-item>
            <b-list-group-item 
              :key="template._id" 
              v-for="(template, index) in templates" 
              class="d-flex justify-content-between align-items-center" 
              :to="`/${templateType}/${template._id}`"
              :variant="alternateRowColors(index)"
            >
              {{ template.name }}
              <b-badge href="#"  @click="deleteTemplate(template)" variant="secondary">Delete</b-badge>
            </b-list-group-item>
          </b-list-group>
          <br>       
          <b-link to="/transfers">Go to main page</b-link>
        </b-col>
      </b-row>
    </div>
  </div>
</template>


<script>
import axios from 'axios'
import Navbar from '../components/Navbar.vue'
import { errorHandler } from '../util/errors'


export default {
  name: 'Index', 
  components: {
    Navbar
  },
  props: [
    'msg',
    'templateType'
  ],
  data() {
    return {
      loadError: '',
      postStatus: {},
      templates: [],
      isLoading: false
    }
  },
  methods: {

    alternateRowColors(index) {
      let variant;
      if (index % 2 === 0 ) {
        variant = 'light'
      } else {
        variant = 'secondary'
      }
      return variant
    },

    async getTemplates() {
      this.isLoading = true
      try {
        const res = await axios.get(`/api/${this.templateType}s/`)
        this.templates = res.data
        this.isLoading = false
      } catch (err) {
        const errInfo = errorHandler(err)
        if (errInfo.status === 401) {
          this.$router.push({ name: 'Login', params: { msg: { text: errInfo.message, context: 'danger' }}})
        } else {
          this.loadError = errInfo.message
          this.isLoading = false
        }
      }
    },

    async deleteTemplate(template) {
      if (confirm(`Are you sure you want to permanently delete ${template.name}?`)) {
        this.isLoading = true
        try {
          await axios.delete(`/api/${this.templateType}s/${template._id}`)
          this.templates = this.templates.filter(t => t._id !== template._id)
          this.postStatus = { text: `${template.name} successfully deleted`, context: 'success' }
          this.isLoading = false
        } catch (err) {
          const errInfo = errorHandler(err)
          if (errInfo.status === 401) {
            this.$router.push({ name: 'Login', params: { msg: { text: errInfo.message, context: 'danger' }}})
          } else {
            this.postStatus = { text: errInfo.message, context: 'danger' };
            this.isLoading = false
          }
        }
      } else {
        return 
      }
    }
  },
  async mounted () {
    if (this.msg && this.msg.text) {
      this.postStatus = this.msg
    }
    await this.getTemplates()
  },
  watch: {
    async $route() {
      this.isLoading = false
      this.templates = []
      this.loadError = '',
      this.postStatus = {}, 
      await this.getTemplates()
    }
  } 
}
</script>      
