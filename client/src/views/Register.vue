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
                <h3>Register</h3>
              </div>
            </template>
            <br>
            <b-form @submit.prevent="register"  @input="errorMsg = ''">
              <b-form-group>
                <b-form-input 
                  placeholder="Enter invitation code" 
                  v-model="$v.form.invitationCode.$model" 
                  :state="validateState('invitationCode')" 
                  aria-describedby="invitationCode-live-feedback"
                >
                </b-form-input>
                <b-form-invalid-feedback id="invitationCode-live-feedback">Invitation code required</b-form-invalid-feedback>
              </b-form-group>
              <b-form-group description="Username is case insensitive and can be the same as your email">
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
                  placeholder="Enter email" 
                  v-model="$v.form.email.$model" 
                  :state="validateState('email')"
                  aria-describedby="email-live-feedback"
                >
                </b-form-input>
                <b-form-invalid-feedback id="email-live-feedback">Valid email address required</b-form-invalid-feedback>
              </b-form-group>
              <b-form-group>
                <b-form-input 
                  :type="passwordFieldType"
                  placeholder="Enter password" 
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
                  placeholder="Confirm password" 
                  autocomplete="on"
                  v-model="$v.form.confirmedPassword.$model" 
                  :state="validateState('confirmedPassword')"
                  aria-describedby="confirmedPassword-live-feedback"
                >
                </b-form-input>
                <b-form-invalid-feedback id="confirmedPassword-live-feedback">Confirmed password must match password</b-form-invalid-feedback>
              </b-form-group>
              <div id="password-details"> 
                <b-form-checkbox v-model="passwordFieldType" value="text" unchecked-value="password">Show Password</b-form-checkbox>
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
              <b-button type="submit" variant="info"  @click="errorMsg = ''">Register</b-button>
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
import { required, sameAs, email	} from 'vuelidate/lib/validators'
import { isStrongPassword } from '../util/validators'
import { errorHandler } from '../util/errors'


export default {
  name: 'Register',
  components: {
    Navbar
  },
  mixins: [validationMixin],
  data() {
    return {
      passwordFieldType: 'password',
      form: {
        invitationCode: '',
        username: '',
        email: '',
        password: '',
        confirmedPassword: ''
      }, 
      errorMsg: '',
      isLoading: false
    }
  },
  validations: {
    form: {
      invitationCode: {
        required
      },
      username: {
        required
      },
      email: {
        required, 
        email
      },
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
      const { $dirty, $error } = this.$v.form[field]
      return $dirty ? !$error : null;
    },
    
    async register() {
      this.$v.form.$touch()
      if (!this.$v.form.$anyError) {
        this.isLoading = true
        try {
          await axios.post('/api/user/register', this.form)
          this.$router.push({ name: 'Login', params: { msg: { text: 'Registration successful! Please login', context: 'success' }}})
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