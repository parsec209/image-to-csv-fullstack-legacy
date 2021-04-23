/**
 * PostService module
 * @module PostService
 */

const { validateArgs } = require('../util/ArgsValidator')
const InputError = require('../util/InputError')

// @ts-check


/**
 * Class to create a postService object
 */
class PostService {
  /**
   * Create a postService
   * @param {Object} Model - Mongoose constructor, see {@link https://mongoosejs.com/docs/api/model.html#model_Model}
   */
  constructor (Model) {
    validateArgs(['{schema: Object, ...}'], arguments)
    this.model = Model
  }


  //Note: 'document' in this module refers to any Mongoose model instance, which in this case can be either a 'Header' or 'Doc' instance


  /**
   * Finds all documents using query
   * @param {Object} query - Query
   * @returns {Promise<Array<Object>>} - Array of found documents
   */
  async findAll(query) {  
    validateArgs(['Object'], arguments)
    const documents = await this.model.find(query)
    return documents
  }


  /**
   * Finds a document by its ID
   * @param {string} id - Document ID
   * @returns {Promise<Object>} - Found document
   */
  async find(id) {
    validateArgs(['String'], arguments)
    const document = await this.model.findById(id)
    return document
  }


  /**
   * Posts a document to db
   * @param {Object} props - Schema keys and their values
   * @returns {Promise<Object>} - Newly created document
   */
  async post(props) {  
    validateArgs(['{user: Object, ...}'], arguments)
    const document = new this.model(props)

    const countDupNames = await this.model.countDocuments({ name: document.name, 'user.id': document.user.id })
    if (countDupNames) {
      throw new InputError(`The following name has already been used: ${document.name}`, 400)
    }

    //only for recurring docs 
    if (document.idPhrase) {
      const countDupIDPhrases = await this.model.countDocuments({ idPhrase: document.idPhrase, 'user.id': document.user.id })
      if (countDupIDPhrases) {
        throw new InputError(`The following ID phrase has already been used: ${document.idPhrase}`, 400)
      }
    }

    await document.save()
    return document
  }


  /**
   * Updates an existing document
   * @param {Object} document - Document to update
   * @param {Object} props - Schema keys and their values
   * @returns {Promise<Object>} - Updated document
   */
  async update(document, props) {  
    validateArgs(['{name: String, user: Object, ...}', 'Object'], arguments)

    if (props.hasOwnProperty('name')) {
      const countDupNames = await this.model.countDocuments({ name: props.name, _id: { $ne: document._id }, 'user.id': document.user.id })
      if (countDupNames) {
        throw new InputError(`The following name has already been used: ${props.name}`, 400)
      }
    }

    //only for recurring docs 
    if (props.hasOwnProperty('idPhrase')) {
      const countDupIDPhrases = await this.model.countDocuments({ idPhrase: props.idPhrase, _id: { $ne: document._id }, 'user.id': document.user.id })
      if (countDupIDPhrases) {
        throw new InputError(`The following ID phrase has already been used: ${props.idPhrase}`, 400)
      }
    }

    for (let prop in props) {
      document[prop] = props[prop]
    }
    await document.save()
    return document
  }


  /**
   * Deletes a document
   * @param {Object} document - Document to delete
   * @returns {Promise<Object>} - Deleted document
   */
  async destroy(document) {  
    validateArgs(['{name: String, user: Object, ...}'], arguments)
    await this.model.deleteOne({ _id: document._id })
    return document
  }
}


module.exports = PostService