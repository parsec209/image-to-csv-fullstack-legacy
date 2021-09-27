swaggerJsdoc = require('swagger-jsdoc')


const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Image-To-CSV API',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      }
    ]
  },
  //relative to root directory
  apis: ['./server/routes/api/*.js']
}


module.exports = swaggerJsdoc(options)



  
