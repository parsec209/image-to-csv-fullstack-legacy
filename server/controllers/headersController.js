const Header = require('../models/header')
const PostService = require('../services/PostService')



module.exports = {


  getHeaders: async (req, res, next) => {  
    const userID = req.user._id
    try {
      const postService = new PostService(Header)
      const headers = await postService.findAll({ 'user.id': userID }) 
      return res.json(headers)
    } catch (err) { 
      return next(err)
    }
  },


  getHeader: (req, res, next) => {  
    const header = req.header
    return res.json(header)
  },


  postHeader: async (req, res, next) => {
    const userID = req.user._id
    const { name, cells } = req.body
    try { 
      const postService = new PostService(Header)
      const header = await postService.post({ name, cells, user: { id: userID }})
      return res.json(header)
    } catch (err) { 
      return next(err)
    }
  },


  editHeader: async (req, res, next) => {  
    const header = req.header
    const { name, cells } = req.body
    try {
      const postService = new PostService(Header)
      const updatedHeader = await postService.update(header, { name, cells }) 
      return res.json(updatedHeader)
    } catch (err) { 
      return next(err)
    }
  },


  deleteHeader: async (req, res, next) => {  
    const header = req.header
    try {
      const postService = new PostService(Header)
      const deletedHeader = await postService.destroy(header)
      return res.json(deletedHeader)
    } catch (err) { 
      return next(err)
    }
  }
}

