<template>
  <b-navbar toggleable="lg" type="dark" variant="dark">
    <div class="container">
      <b-navbar-brand to="/">Image-To-CSV</b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item to="/instructions">Instructions</b-nav-item>
        </b-navbar-nav>
        <b-navbar-nav v-if="user" class="ml-auto">
          <b-nav-item-dropdown :text="user.username" right>
            <b-dropdown-item to="/profile">Account settings</b-dropdown-item>
            <b-dropdown-item to="/index/header">My headers</b-dropdown-item>
            <b-dropdown-item to="/index/doc">My recurring documents</b-dropdown-item>
            <b-dropdown-item @click="logout"><em>Logout</em></b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>
        <b-navbar-nav v-else class="ml-auto">
          <b-nav-item to="/register">Register</b-nav-item>
          <b-nav-item to="/login">Login</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </div>
  </b-navbar>
</template>


<script>
import axios from 'axios'
import { errorHandler } from '../util/errors'
import { mapGetters, mapActions } from 'vuex'


export default {
  name: 'Navbar',
  methods: { 
    ...mapActions(['setUser']), 
    async logout() {
      try {
        await axios.get('/api/user/logout')
        return this.$router.push({ name: 'Login', params: { msg: { text: 'Signed out', context: 'success' }}})
      } catch (err) {
        const errInfo = errorHandler(err)
        return this.$router.push({ name: 'Login', params: { msg: { text: errInfo.message, context: 'danger' }}})
      }
    }
  },
  computed: mapGetters(['user']),
}
</script>


<style>

.navbar-dark .navbar-nav .nav-link {
  color: rgba(255,255,255);
}

</style>