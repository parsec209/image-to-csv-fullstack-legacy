import * as Sentry from '@sentry/vue'  


//central error handler for client
export const errorHandler = (err) => {

  //axios errors
  if (err.response) {
    return { status: err.response.status, message: err.response.data.message || err.response.data }
  }
    
  //network error
  else if (err.message === 'Network Error') {
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(err);   
    } 
    return { message: 'Server connection error, please try again' }
  }

  //other operational errors
  else {
    return { message: err.message }
  }
}



