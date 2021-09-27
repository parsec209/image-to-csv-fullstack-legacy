const passport = require('passport')
const Header = require('../models/header')
const Doc = require('../models/doc')
const PostService = require('../services/postService')
const InputError = require('../util/inputError')
const { validateReqParams } = require('../util/argsValidator')



module.exports = {


  authenticate: (req, res, next) => {
    //if user is already logged in, new session will be generated upon successful auth, otherwise session will be destroyed 
    if (req.session.passport) {
      req.session.regenerate(err => {
        if (err) { 
          return next(err)
        }
      })
    } 
    passport.authenticate('local', (err, user) => {
      if (err) {  
        return next(err)
      } if (!user) { 
        return next(new InputError('Authentication failed', 401))
      } else {
        req.logIn(user, (err) => {
          if (err) { 
            return next(err)
          } else {
            return next()
          }
        })
      }
    })(req, res, next)
  },


  isLoggedIn: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    } else {
      return next(new InputError('Not authenticated, please login', 401)) 
    }
  },


  isUserHeader: async (req, res, next) => {
    try {
      const headerID = validateReqParams(req.params.id)
      const postService = new PostService(Header)
      const header = await postService.find(headerID)
      if (!header) {
        return next(new InputError('No header found with that ID', 404))
      }
      if (header.user.id.equals(req.user._id)) {
        req.header = header
        return next()
      } else {
        return next(new InputError('Not authorized to access header', 403)) 
      }
    } catch (err) {
      return next(err)
    }
  },
  
  
  isUserDoc: async (req, res, next) => {
    try {
      const docID = validateReqParams(req.params.id)
      const postService = new PostService(Doc)
      const doc = await postService.find(docID)
      if (!doc) {
        return next(new InputError('No doc found with that ID', 404))
      }
      if (doc.user.id.equals(req.user._id)) {
        req.doc = doc
        return next()
      } else {
        return next(new InputError('Not authorized to access doc', 403)) 
      }
    } catch (err) {
      return next(err)
    }
  }
}




