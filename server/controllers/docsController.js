const Doc = require('../models/doc')
const PostService = require('../services/PostService')



module.exports = {


  getDocs: async (req, res, next) => {  
    const userID = req.user._id
    try {
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
    const userID = req.user._id
    const { name, idPhrase, header, dataRows } = req.body
    try {
      const postService = new PostService(Doc)
      const doc = await postService.post({ name, idPhrase, header, dataRows, user: { id: userID }}) 
      return res.json(doc)
    } catch (err) { 
      return next(err)
    }
  },


  editDoc: async (req, res, next) => {  
    const doc = req.doc
    const { name, idPhrase, header, dataRows } = req.body
    try {
      const postService = new PostService(Doc)
      const updatedDoc = await postService.update(doc, { name, idPhrase, header, dataRows })
      return res.json(updatedDoc)
    } catch (err) { 
      return next(err)
    }
  },


  deleteDoc: async (req, res, next) => {  
    const doc = req.doc
    try {
      const postService = new PostService(Doc)
      const deletedDoc = await postService.destroy(doc)
      return res.json(deletedDoc)
    } catch (err) { 
      return next(err)
    }
  }
}