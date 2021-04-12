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
                <b-alert :show="errorMsg.length > 0" variant="danger">{{ errorMsg }}</b-alert>
                <div v-if="isLoading">
                  <b-spinner variant="secondary" label="Loading"></b-spinner>
                </div>   
                <h3>Reset password</h3>
              </div>
            </template>
            <b-card-text>Enter the email address you used when registering your account and a password reset link will be emailed to you.</b-card-text>
            <br>
            <b-form @submit.prevent="emailResetLink" @input="errorMsg = ''">
              <b-form-group>
                <b-form-input 
                  placeholder="Enter email" 
                  v-model="$v.form.email.$model" 
                  :state="validateState('email')"
                  aria-describedby="email-live-feedback"
                >
                </b-form-input>
                <b-form-invalid-feedback id="email-live-feedback">Please enter your email</b-form-invalid-feedback>
              </b-form-group>
              <br>
              <b-button type="submit" variant="info" @click="errorMsg = ''">Email password reset link</b-button>
            </b-form>
            <template #footer>
              <b-link to="/login">Go to login</b-link>
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
import { required, email	} from 'vuelidate/lib/validators'
import { errorHandler } from '../util/errors'


export default {
  name: 'Forgot',
  components: {
    Navbar
  },
  mixins: [validationMixin],
  data() {
    return {
      form: {
        email: ''
      }, 
      errorMsg: '',
      isLoading: false
    }
  },
  validations: {
    form: {
      email: {
        required,
        email
      }
    }
  },
  methods: {

    validateState(field) {
      const { $dirty, $error } = this.$v.form[field];
      return $dirty ? !$error : null;
    },
    
    async emailResetLink() {
      this.$v.form.$touch();
      if (!this.$v.form.$anyError) {
        this.isLoading = true
        try {
          await axios.post('/api/user/forgot', this.form)
          this.$router.push({ name: 'Login', params: { msg: { text: 'Password reset email sent. Please check spam folder if it doesn\'t appear within a few minutes.', context: 'success' }}})
        } catch (err) {
          this.errorMsg = errorHandler(err).message
          this.isLoading = false
        }
      }
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