const mongoose = require('mongoose')


module.exports = async () => {

  const databaseUri = process.env.MONGODB_URI
  const options = {
    useNewUrlParser: true, 
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true 
  }  
  await mongoose.connect(databaseUri, options)
  return mongoose.connection
}
