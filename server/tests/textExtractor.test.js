const fs = require('fs')
const {Storage} = require('@google-cloud/storage')
const storage = new Storage()
const bucket = storage.bucket(process.env.STORAGE_BUCKET)
const getDocText = require('../services/textExtractor')
const Joi = require('joi');



const uploadDir = __dirname + '/seeds/uploads/cloud/validExts'
const fileNames = fs.readdirSync(uploadDir)
const fileNamesTable = fileNames.map(fileName => { return [fileName] })
const testFiles = []


beforeAll(async () => {
  await Promise.all(fileNames.map(async fileName => {
    let contentType 
    if (fileName.includes('pdf')) {
      contentType = 'application/pdf'
    }
    if (fileName.includes('tiff') || fileName.includes('tif')) {
      contentType = 'image/tiff'
    }
    if (fileName.includes('gif')) {
      contentType = 'image/gif'
    }
    const file = await bucket.upload(`${uploadDir}/${fileName}`, { destination: `testUserID/uploads/testBatchID/${fileName}`, metadata: { contentType }})
    testFiles.push({ name: fileName, data: file[0] })
  }))
})


afterAll(async () => {
  await bucket.deleteFiles()
})


describe('extracting document text using GCP image annotation', () => {

  // see https://cloud.google.com/vision/docs/reference/rest/v1/AnnotateImageResponse

  const schema = Joi.object({
    fileName: Joi.string().required(),
    extraction: Joi.array().items(
      Joi.object({
        fullTextAnnotation: Joi.object({
          pages: Joi.array().items(
            Joi.object({
              blocks: Joi.array().items(
                Joi.object({
                  paragraphs: Joi.array().items(
                    Joi.object({
                      words: Joi.array().items(
                        Joi.object({
                          symbols: Joi.array().items(
                            Joi.object({
                              text: Joi.string().required(),
                              boundingBox: Joi.object({
                                vertices: Joi.array().items(
                                  Joi.object({
                                    x: Joi.number().required(),
                                    y: Joi.number().required()
                                  })
                                ).required(),
                                normalizedVertices: Joi.array().items(
                                  Joi.object({
                                    x: Joi.number().required(),
                                    y: Joi.number().required()
                                  })
                                ).required()
                              }).required().allow(null),
                              property: Joi.object({
                                detectedBreak: Joi.object({
                                  type: Joi.string().required()
                                }).required().unknown().allow(null)
                              }).required().unknown().allow(null)
                            }).required().unknown()
                          ).required()
                        }).required().unknown()
                      ).required()
                    }).required().unknown()
                  ).required()
                }).required().unknown()
              ).required(),
            }).required().unknown(),
          ).required(),
          text: Joi.string().required()
        }).required().allow(null)
      }).required().unknown()
    ).required()
  })

  test.each(fileNamesTable)('outputs object matching specified schema (ignores duplicate or invalid page selections)', async (fileName) => {
    const testFile = testFiles.find(file => file.name === fileName).data
    const docText = await getDocText(testFile, [1, 1, 2, 3, -1000])
    expect(schema.validate(docText)).not.toHaveProperty('error') 
  })
  test('throws error when no valid pages selected', async () => {
    await expect(getDocText(testFiles[0].data, [-1000])).rejects.toThrow('3 INVALID_ARGUMENT: No pages found.')
  })
})



    




    



















