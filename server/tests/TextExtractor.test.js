const fs = require('fs')
const {Storage} = require('@google-cloud/storage')
const storage = new Storage()
const bucket = storage.bucket(process.env.STORAGE_BUCKET)
const TextExtractor = require('../services/TextExtractor')
const typeCheck = require('type-check').typeCheck



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


describe('instantiating TextExtractor', () => {
  test('initializes constructor', async () => {
    const textExtractor = new TextExtractor(testFiles[0].data, [1, 2, 3])
    expect(textExtractor.doc).toBeTruthy()
    expect(textExtractor.pageSelections).toHaveLength(3)
  })
})


describe('extracting document text using GCP', () => {

  const expectedOutput = `{
    fileName: String,
    extraction: [
      {
        fullTextAnnotation: Null | {
          pages: [
            {
              blocks: [
                {
                  paragraphs: [
                    {
                      words: [
                        {
                          symbols: [
                            {
                              text: String,
                              boundingBox: Null | {
                                vertices: [Object],
                                normalizedVertices: [Object]
                              },
                              property: Null | {
                                detectedBreak: Null | {
                                  type: String,
                                  ...
                                },
                                ...
                              },
                              ...
                            }
                          ],
                          boundingBox: {
                            vertices: [Object],
                            normalizedVertices: [Object]
                          },
                          ...
                        }
                      ],
                      ...
                    }
                  ],
                  ...
                }
              ],
              ...
            }
          ],
          text: String
        }, 
        ...
      }
    ]
  }`

  test.each(fileNamesTable)('outputs JSON with expected structure and property types (ignores duplicate or invalid page selections)', async (fileName) => {
    const testFile = testFiles.find(file => file.name === fileName).data
    const textExtractor = new TextExtractor(testFile, [1, 1, 2, 3, -1000])
    const docText = await textExtractor.getDocText()
    expect(typeCheck(expectedOutput, docText)).toBe(true) 
  })
  test('throws error when no valid pages selected', async () => {
    const textExtractor = new TextExtractor(testFiles[0].data, [-1000])
    await expect(textExtractor.getDocText()).rejects.toThrow('3 INVALID_ARGUMENT: No pages found.')
  })
})



    




    



















