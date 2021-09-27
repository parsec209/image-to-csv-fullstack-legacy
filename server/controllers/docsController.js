const Doc = require('../models/doc')
const PostService = require('../services/postService')
const Joi = require('joi')
const { validateReqBody, schemas } = require('../util/argsValidator')



module.exports = {


  getDocs: async (req, res, next) => {  
    try {
      const userID = req.user._id
      const postService = new PostService(Doc)
      const docs = await postService.findAll({ 'user.id': userID }) 
      return res.json(docs)
    } catch (err) { 
      return next(err)
    }
  },


  getDoc: (req, res, next) => {  
    const doc = req.doc
    return res.json(doc)
  },


  postDoc: async (req, res, next) => {  
    try {
      const userID = req.user._id
      const { name, idPhrase, idPhrase2, header, dataRows } = validateReqBody(req.body, 
        {
          name: Joi.string().trim().required(),
          idPhrase: Joi.string().trim().required(),
          idPhrase2: Joi.string().trim(),
          header: schemas.headerCells.required(),
          dataRows: schemas.dataRows.required()
        }
      )
      const postService = new PostService(Doc)
      const doc = await postService.post({ name, idPhrase, idPhrase2, header, dataRows, user: { id: userID }}) 
      return res.json(doc)
    } catch (err) { 
      return next(err)
    }
  },


  editDoc: async (req, res, next) => {  
    try {
      const doc = req.doc
      const { name, idPhrase, idPhrase2, header, dataRows } = validateReqBody(req.body, 
        {
          name: Joi.string().trim().required(),
          idPhrase: Joi.string().trim().required(),
          idPhrase2: Joi.string().trim(),
          header: schemas.headerCells.required(),
          dataRows: schemas.dataRows.required()
        }
      )
      const postService = new PostService(Doc)
      const updatedDoc = await postService.update(doc, { name, idPhrase, idPhrase2, header, dataRows })
      return res.json(updatedDoc)
    } catch (err) { 
      return next(err)
    }
  },


  deleteDoc: async (req, res, next) => {  
    try {
      const doc = req.doc
      const postService = new PostService(Doc)
      const deletedDoc = await postService.destroy(doc)
      return res.json(deletedDoc)
    } catch (err) { 
      return next(err)
    }
  }
}