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
          <b-button variant="info" to="/Construction" size="lg">View Demo</b-button>
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
    <br>
    <br>
    <hr>
    <div class="container">
     
      
      <b-card-group deck>
        <b-card class="text-center">
          <template #header>
            <h5>Supported File Formats</h5>
          </template>
          <b-icon icon="file-earmark-text" font-scale="2"></b-icon>
          <br>
          <br>
          <b-card-text>
            <p>
              Multiple pages or frames:
              <br>
              PDF, TIFF, GIF
            </p>
          </b-card-text>
        </b-card>
        <b-card class="text-center">
          <template #header>
            <h5>Open Source</h5>
          </template>
          <b-card-text>
            <b-icon icon="unlock" font-scale="2"></b-icon>
            <br>
            <br>
            <p>View, modify, and contribute to the code.</p>
            <b-button variant="secondary" href="https://github.com/ryanjg08/image-to-csv">Go to Github</b-button>
          </b-card-text>
        </b-card>
        <b-card class="text-center">
          <template #header>
            <h5>API Integration</h5>
          </template>
          <b-card-text>
            <b-icon icon="cloud-arrow-up" font-scale="2" class="mr-1"></b-icon>
            <b-icon icon="gear" font-scale="2"></b-icon>
            <br>
            <br>
            <p>Integrate the API into your own applications or workflows.</p>
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