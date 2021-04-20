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
                  <br>
                  <br>
                </div>   
                <h3>New password</h3>
              </div>
            </template>
            <br>
            <b-form @submit.prevent="resetPassword" @input="errorMsg = ''">
              <b-form-group>
                <b-form-input 
                  :type="passwordFieldType"
                  placeholder="Enter new password" 
                  autocomplete="on"
                  v-model="$v.form.password.$model" 
                  :state="validateState('password')"
                  aria-describedby="password-live-feedback"
                >
                </b-form-input>
                <b-form-invalid-feedback id="password-live-feedback">Valid password required</b-form-invalid-feedback>
              </b-form-group>
              <b-form-group>
                <b-form-input 
                  :type="passwordFieldType"
                  placeholder="Confirm new password" 
                  autocomplete="on"
                  v-model="$v.form.confirmedPassword.$model" 
                  :state="validateState('confirmedPassword')"
                  aria-describedby="confirmedPassword-live-feedback"
                >
                </b-form-input>
                <b-form-invalid-feedback id="confirmedPassword-live-feedback">Confirmed password must match password</b-form-invalid-feedback>
              </b-form-group>
              <div id="password-details"> 
                <b-form-checkbox v-model="passwordFieldType" value="text" unchecked-value="password">Show Passwords</b-form-checkbox>
                <br>
                <p>Password must contain:</p>
                <ul>
                  <li>At least eight characters</li>
                  <li>At least one upper case letter</li>
                  <li>At least one lower case letter</li>
                  <li>At least one number</li>
                  <li>No special characters (i.e. #*@)</li>
                </ul>
              </div>
              <br>
              <b-button type="submit" variant="info" @click="errorMsg = ''">Reset password</b-button>
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
import { required, sameAs } from 'vuelidate/lib/validators'
import { isStrongPassword } from '../util/validators'
import { errorHandler } from '../util/errors'


export default {
  name: 'Reset',
  components: {
    Navbar
  },
  props: [
    'token'
  ],
  mixins: [validationMixin],
  data() {
    return {
      passwordFieldType: 'password',
      form: {
        password: '',
        confirmedPassword: ''
      }, 
      errorMsg: '',
      isLoading: false
    }
  },
  validations: {
    form: {
      password: {
        required,
        isStrongPassword
      },
      confirmedPassword: {
        required,
        sameAsPassword: sameAs('password')
      }
    }
  },
  methods: {

    validateState(field) {
      const { $dirty, $error } = this.$v.form[field];
      return $dirty ? !$error : null;
    },

    async resetPassword() {
      this.$v.form.$touch();
      if (!this.$v.form.$anyError) {
        this.isLoading = true
        try {
          await axios.post(`/api/user/reset/${this.token}`, this.form)
          this.$router.push({ name: 'Login', params: { msg: { text: 'Password successfully reset and email confirmation was sent to you. Please login.', context: 'success' }}})
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

#password-details {
  font-size: smaller;
}

.card-footer {
  border-top: none
}

</style>