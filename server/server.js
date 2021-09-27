//require('dotenv').config()
const logger = require('./config/logger')
const connectDB = require('./loaders/db')
const setupApp = require('./loaders/app')
const port = process.env.PORT || 3000


connectDB()
  .then(dbConnection => {
    logger.log({ level: 'info', message: `User ${dbConnection.id} connected to database` })

    const app = setupApp(dbConnection)
    app.listen(port, () => logger.log({ level: 'info', message: `Server started on port ${port}` }))

    dbConnection.on('disconnected', () => {
      logger.log({ level: 'error', message: `User ${dbConnection.id} disconnected from database` })
    })

    dbConnection.on('reconnected', () => {
      logger.info({ level: 'info', message: `User ${dbConnection.id} reconnected to database` })
    })
  })
  .catch(err => {
    logger.log({ level: 'error', message: err })
  })

  
  


 

