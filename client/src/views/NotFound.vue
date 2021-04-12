<template>
  <div>
    <Navbar/>
    <br>
    <br>
    <center>
      <h1>Page not found!</h1>
      <p>
        <b-link to="/">Go home</b-link>
      </p>
    </center>
  </div>
</template>


<script>
import Navbar from '../components/Navbar.vue'


export default {
  name: 'NotFound',
  components: {
    Navbar
  }
}
</script>