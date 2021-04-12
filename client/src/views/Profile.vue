<template>
  <div>
    <Navbar/>
    <br>
    <div class="container">
      <br>
      <b-row>
        <b-col lg="6" offset-lg="3">
          <b-card header-tag="header" footer-tag="footer">
            <template #header>
              <div class="text-center">
                <b-alert :show="Object.keys(status).length > 0" :variant="status.context">{{ status.text }}</b-alert>
                <div v-if="isLoading">
                  <b-spinner variant="secondary" label="Loading"></b-spinner>
                </div>   
                <h3>Account Settings</h3>
              </div>
            </template>
            <br>
            <b-form @submit.prevent="update" @input="status={}">
              <b-form-group description="Username and email cannot be changed" label="Username:" label-for="username-input">
                <b-form-input id="username-input" :value="user ? user.username : ''" disabled></b-form-input>
              </b-form-group>
              <b-form-group label="Email:" label-for="email-input">
                <b-form-input id="email-input" :value="user ? user.email : ''" disabled></b-form-input>
              </b-form-group>
              <b-form-group label="Change password:" label-for="password-input">
                <b-form-input 
                  id="password-input"
                  :type="passwordFieldType"
                  placeholder="Enter current password" 
                  autocomplete="on"
                  v-model="$v.form.oldPassword.$model" 
                  :state="validateState('oldPassword')"
                  aria-describedby="oldPassword-live-feedback"
                >
                </b-form-input>
                <b-form-invalid-feedback id="oldPassword-live-feedback">Current password required</b-form-invalid-feedback>
              </b-form-group>

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
                <b-form-invalid-feedback id="password-live-feedback">Valid password required, and must differ from current password</b-form-invalid-feedback>
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
                <b-form-invalid-feedback id="confirmedPassword-live-feedback">Confirmed password must match new password</b-form-invalid-feedback>
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
              <b-button type="submit" variant="info" @click="status={}">Save Changes</b-button>
            </b-form>
            <template #footer>
              <b-link to="/transfers">Go to main page</b-link>
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
import { required, sameAs, not } from 'vuelidate/lib/validators'
import { isStrongPassword } from '../util/validators'
import { mapGetters, mapActions } from 'vuex'
import { errorHandler } from '../util/errors'


export default {
  name: 'Profile',
  components: {
    Navbar
  },
  mixins: [validationMixin],
  data() {
    return {
      passwordFieldType: 'password',
      form: {
        oldPassword: '',
        password: '',
        confirmedPassword: ''
      }, 
      status: {},
      isLoading: false
    }
  },
  validations: {
    form: {
      oldPassword: {
        required
      },
      password: {
        required,
        isStrongPassword,
        notSameAsOldPassword: not(sameAs('oldPassword'))
      },
      confirmedPassword: {
        required,
        sameAsPassword: sameAs('password')
      }
    }
  },
  methods: { 

    ...mapActions(['setUser']),  

    validateState(field) {
      const { $dirty, $error } = this.$v.form[field]
      return $dirty ? !$error : null;
    },

    async changePassword() {
      await axios.post('/api/user/change', this.form)
    },

    async logout() {
      try {
        await axios.get('/api/user/logout') 
        this.$router.push({ name: 'Login', params: { msg: { text: 'Password successfully changed and an email confirmation was sent to you. Please login with new password.', context: 'success' }}})
      } catch (err) {
        this.$router.push({ name: 'Login', params: { msg: { text: errorHandler(err).message, context: 'danger' }}})
      }
    },

    async update() {
      this.$v.form.$touch()
      if (!this.$v.form.$anyError) {
        this.isLoading = true
        try {
          await this.changePassword()
          await this.logout()
        } catch (err) {
          const errInfo = errorHandler(err)
          if (errInfo.status === 401) {
            this.$router.push({ name: 'Login', params: { msg: { text: errInfo.message, context: 'danger' }}})
          } else {
            this.status = { text: errInfo.message, context: 'danger' }
            this.isLoading = false
          }
        }
      }
    }
  },
  computed: mapGetters(['user']),
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