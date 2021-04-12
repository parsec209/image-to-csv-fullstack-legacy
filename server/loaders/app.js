module.exports = (dbConnection) => {

  const express = require('express')
  const app = express()
  const passport = require('passport')
  const session = require('express-session')
  const MongoStore = require('connect-mongo')(session)
  const morgan = require('morgan')
  const logger = require('../config/logger')
  const User = require('../models/user')
  const userRoutes = require('../routes/api/user')
  const transferRoutes = require('../routes/api/transfers')
  const headerRoutes = require('../routes/api/headers')
  const recurringDocRoutes = require('../routes/api/docs')
  const errorHandler = require('../middleware/errorHandler')
  const path = require('path')
  


  app.use(express.urlencoded({extended: true}))
  app.use(express.json())

  
  //session config
  const store = new MongoStore({ mongooseConnection: dbConnection })
  app.use(session({
    store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 21600000 }  //expires after 6 hours
  }))


  //passport config
  app.use(passport.initialize())
  app.use(passport.session())
  passport.use(User.createStrategy())
  passport.serializeUser(User.serializeUser())
  passport.deserializeUser(User.deserializeUser())


  //HTTP request logging
  app.use(morgan('combined', { stream: logger.stream }))


  //API routes
  app.use('/api/user', userRoutes)
  app.use('/api/headers', headerRoutes)
  app.use('/api/docs', recurringDocRoutes)
  app.use('/api/transfers', transferRoutes)


  //SPA route
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.normalize(`${__dirname}/../public/`)))
    app.get(/.*/, (req, res) => res.sendFile(path.normalize(`${__dirname}/../public/index.html`)))
  }

  
  //route error handler 
  app.use(errorHandler)


  return app
}
