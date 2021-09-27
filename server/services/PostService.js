/**
 * postService module
 * @module postService
 */

const { validateArgs, schemas } = require('../util/argsValidator')
const InputError = require('../util/inputError')
const Joi = require('joi')


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
    validateArgs(arguments, { 0: Joi.function() })    
    this.model = Model
  }


  //Note: 'document' in this module refers to a generic Mongoose model instance (can be either a header or recurring doc)


  /**
   * Finds all documents using query
   * @param {Object} query - Query
   * @returns {Promise<Array<Object>>} - Array of found documents
   */
  async findAll(query) {  
    validateArgs(arguments, { 0: Joi.object() })    
    const documents = await this.model.find(query)
    return documents
  }


  /**
   * Finds a document by its ID
   * @param {string} id - Document ID
   * @returns {Promise<Object>} - Found document
   */
  async find(id) {
    validateArgs(arguments, { 0: Joi.string() })    
    const document = await this.model.findById(id)
    return document
  }


  /**
   * Posts a document to db
   * @param {Object} props - Schema keys and their values
   * @returns {Promise<Object>} - Newly created document
   * @throws {InputError} - document name already exists
   * @throws {InputError} - recurring doc idPhrase already exists
   */
  async post(props) {  
    validateArgs(arguments, 
      {
        0: Joi.object({
          user: Joi.object().required()
        }).unknown()      
      }
    )    
    const document = new this.model(props)

    const countDupNames = await this.model.countDocuments({ name: document.name, 'user.id': document.user.id })
    if (countDupNames) {
      throw new InputError(`The following name has already been used: ${document.name}`, 500)
    }

    //only applies to recurring docs 
    if (document.idPhrase) {
      const countDupIDPhrases = await this.model.countDocuments({ idPhrase: document.idPhrase, 'user.id': document.user.id })
      if (countDupIDPhrases) {
        throw new InputError(`The following ID phrase has already been used: ${document.idPhrase}`, 500)
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
   * @throws {InputError} - document name already exists
   * @throws {InputError} - recurring doc idPhrase already exists
   */
  async update(document, props) {  
    validateArgs(arguments, { 0: schemas.document, 1: Joi.object() })    
    
    if (props.hasOwnProperty('name')) {
      const countDupNames = await this.model.countDocuments({ name: props.name, _id: { $ne: document._id }, 'user.id': document.user.id })
      if (countDupNames) {
        throw new InputError(`The following name has already been used: ${props.name}`, 500)
      }
    }

    //only applies to recurring docs 
    if (props.hasOwnProperty('idPhrase')) {
      const countDupIDPhrases = await this.model.countDocuments({ idPhrase: props.idPhrase, _id: { $ne: document._id }, 'user.id': document.user.id })
      if (countDupIDPhrases) {
        throw new InputError(`The following ID phrase has already been used: ${props.idPhrase}`, 500)
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
    validateArgs(arguments, { 0: schemas.document })    
    await this.model.deleteOne({ _id: document._id })
    return document
  }
}


module.exports = PostService