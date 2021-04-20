<template>
  <div>
    <Navbar/>
    <br>
    <div class="container">
      <br>
      <b-row>
        <b-col md="6" offset-md="3">
          <b-card header-tag="header" footer-tag="footer">
            <template #header>
              <div class="text-center">
                <b-alert :show="Object.keys(status).length > 0" :variant="status.context">{{ status.text }}</b-alert>
                <div v-if="isLoading">
                  <b-spinner variant="secondary" label="Loading"></b-spinner>
                  <br>
                  <br>
                </div>   
                <h3>Login</h3>
              </div>
            </template>
            <br>
            <b-form @submit.prevent="login" @input="status={}">
              <b-form-group>
                <b-form-input 
                  placeholder="Enter username" 
                  v-model="$v.form.username.$model" 
                  :state="validateState('username')" 
                  aria-describedby="username-live-feedback"
                >
                </b-form-input>
                <b-form-invalid-feedback id="username-live-feedback">Username required</b-form-invalid-feedback>
              </b-form-group>
              <b-form-group>
                <b-form-input 
                  type="password"
                  placeholder="Enter password" 
                  autocomplete="on"
                  v-model="$v.form.password.$model" 
                  :state="validateState('password')"
                  aria-describedby="password-live-feedback"
                >
                </b-form-input>
                <b-form-invalid-feedback id="password-live-feedback">Password required</b-form-invalid-feedback>
              </b-form-group>
              <b-link to="/forgot">Forgot password?</b-link>
              <br>
              <br>
              <b-button type="submit" variant="info" @click="status={}">Sign in</b-button>
            </b-form>
            <template #footer>
              <b-link to="/register">New? Register here</b-link>
            </template>
          </b-card>
        </b-col>
      </b-row>
    </div>
  </div>
</template>


<script>
import axios from 'axios'
import Navbar from '../components/Navbar.vue'
import { validationMixin } from 'vuelidate'
import { required	} from 'vuelidate/lib/validators'
import { errorHandler } from '../util/errors'
import { mapActions } from 'vuex'


export default {
  name: 'Login',
  components: {
    Navbar
  },
  props: [
    'msg'
  ],
  mixins: [validationMixin],
  data() {
    return {
      form: {
        username: '',
        password: ''
      }, 
      status: {},
      isLoading: false
    }
  },
  validations: {
    form: {
      username: {
        required, 
      },
      password: {
        required
      }
    }
  },
  methods: {

    ...mapActions(['setUser']),  

    validateState(field) {
      const { $dirty, $error } = this.$v.form[field];
      return $dirty ? !$error : null;
    },
    
    async login() {
      this.$v.form.$touch();
      if (!this.$v.form.$anyError) {
        this.isLoading = true
        try {
          const user = await axios.post('/api/user/login', this.form)
          this.setUser(user.data)
          this.$router.push({ name: 'Transfers' })
        } catch (err) {
          this.status = { text: errorHandler(err).message, context: 'danger' }
          this.isLoading = false 
        }
      }
    },

    setStatus() {
      if (this.msg && this.msg.text) {
        this.status = this.msg
      } else {
        this.status = {}
      }
    }
  },
  mounted() {
    this.setStatus()
  },
  watch: {
    $route() {
      this.setStatus()
    }
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