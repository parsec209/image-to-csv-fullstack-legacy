<template>
  <div>
    <Navbar/>
    <div class="container">
      <br>
      <br>
      <b-row>
        <b-col offset-md="2">
          <h1>Image-To-CSV</h1>
          <p>Generate CSV files from your recurring documents</p>
          <br>
          <b-button variant="info" to="#" size="lg">View Demo</b-button>
          <br>
          <br>
          <b-button class="mr-1" variant="secondary" to="/register">Register</b-button>
          <b-button variant="secondary" to="/login">Login</b-button>
        </b-col>
        <b-col>
          <b-img src="../assets/logo.png" fluid alt="Fluid image"></b-img>
        </b-col>
      </b-row>
    </div>
    <hr>
    <div class="container">
      <div class="border overview">           
        <p class="my-4 mx-3">Welcome to the UI for <i>Image-To-CSV</i>, an <strong>open source</strong> application. It performs OCR on document images and 
          generates CSV files from the extracted metadata. You create rules to control what metadata field names and 
          values will populate the CSV files. Ideal for sets of documents that are received regularly and that have 
          consistent formatting.
          <br>
          <br>
          Registering an account on this domain is by invitation only. However, you are encouraged to contribute, modify, or use the code in your own projects. 
          <br>
          <br>
          <b-link href="https://github.com/ryanjg08/image-to-csv">View code on Github</b-link>
        </p>
         
      </div>
      <br>
      <b-card-group deck>
        <b-card class="text-center">
          <template #header>
            <h5>Supported file formats</h5>
          </template>
          <b-icon icon="file-earmark-text" font-scale="2"></b-icon>
          <br>
          <br>
          <b-card-text>
            <p>
              <i>Multiple pages or frames:</i>
              <br>
              PDF, TIFF, GIF
            </p>
          </b-card-text>
        </b-card>
        <b-card class="text-center">
          <template #header>
            <h5>Tested browsers</h5>
          </template>
          <b-card-text>
            <b-icon icon="phone" font-scale="2"></b-icon>
            <b-icon icon="laptop" font-scale="2"></b-icon>
            <p>
              <br>
              <i>Desktop:</i> 
              <br>
              Windows Chrome 88.0.4324.96
              <br>
              Firefox 84.0.2
              <br>
              <br>
              <i>Mobile:</i> 
              <br>
              IOS Chrome 87.0.4280.77
            </p>
          </b-card-text>
        </b-card>
        <b-card class="text-center">
          <template #header>
            <h5>API integration</h5>
          </template>
          <b-card-text>
            <b-icon icon="cloud-arrow-up" font-scale="2" class="mr-1"></b-icon>
            <b-icon icon="gear" font-scale="2"></b-icon>
            <br>
            <br>
            <p>Google Cloud Vision
              <br>
              Google Cloud Storage
              <br>
              Twilio SendGrid
              <br>
              Solarwinds Papertrail
              <br>
              Sentry
            </p>
          </b-card-text>
        </b-card>
      </b-card-group>
    </div>
  </div>
</template>


<script>
import Navbar from '../components/Navbar.vue'


export default {
  name: 'Landing',
  components: {
    Navbar
  }
}
</script>


<style>

.overview {
  background: #f2f2f2;
  border-color: #d8d8d8!important
}

</style>