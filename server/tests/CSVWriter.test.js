const {Storage} = require('@google-cloud/storage')
const storage = new Storage()
const bucket = storage.bucket(process.env.STORAGE_BUCKET)
const mongoose = require('mongoose')
const { getConsolidatedBlueprints, writeCSVFiles} = require('../services/CSVWriter')
const { v4: uuidv4 } = require('uuid')



const CSVBlueprints = [
  { 
    fileName: 'Doc1',
    CSVHeader: [
      { id: '0', title: 'Company' },
      { id: '1', title: 'Invoice #' },
      { id: '2', title: 'Coding' }
    ],
    CSVDataRows: [
      { 0: '5000', 1: '22345', 2: '0897' }, 
      { 0: '', 1: '', 2: '5421' }
    ]
  },
  { 
    fileName: 'Doc2',
    CSVHeader: [
      { id: '0', title: 'Company2' },
      { id: '1', title: 'Invoice #2' },
      { id: '2', title: 'Coding2' }
    ],
    CSVDataRows: [
      { 0: '3000', 1: '768495', 2: '65123' }, 
      { 0: '', 1: '', 2: '9786' }
    ]
  },
  { 
    fileName: 'Doc3',
    CSVHeader: [
      { id: '0', title: 'Company' },
      { id: '1', title: 'Invoice #' },
      { id: '2', title: 'Coding' }
    ], 
    CSVDataRows: [
      { 0: '8000', 1: '1632', 2: '0098' }, 
    ]
  }
]


const consolidatedBlueprints = [
  { 
    header: [
      { id: '0', title: 'Company' },
      { id: '1', title: 'Invoice #' },
      { id: '2', title: 'Coding' }
    ],
    dataRows: [
      { 0: '5000', 1: '22345', 2: '0897' }, 
      { 0: '', 1: '', 2: '5421' },
      { 0: '8000', 1: '1632', 2: '0098' }, 
    ]
  },
  {
    header: [
      { id: '0', title: 'Company2'},
      { id: '1', title: 'Invoice #2'},
      { id: '2', title: 'Coding2'}
    ],
    dataRows: [
      { 0: '3000', 1: '768495', 2: '65123' }, 
      { 0: '', 1: '', 2: '9786' }
    ]
  }
]


afterAll(async () => {
  await bucket.deleteFiles()
})


describe('consolidating blueprints', () => {
  test('consolidates blueprints that share identical header values', () => {
    const received = getConsolidatedBlueprints(CSVBlueprints)
    expect(JSON.stringify(received)).toBe(JSON.stringify(consolidatedBlueprints))
  })
})
  
  
describe('writing CSV files and uploading them to GCP', () => {
  test('CSV files are written from consolidatedBlueprints and uploaded to storage bucket', async () => {
    const userID = new mongoose.Types.ObjectId()
    const fileBatchID = uuidv4()
    const filesAreInCloud = (files) => {
      return Promise.all(files.map(async (file, index) => {
        const cloudFile = bucket.file(`${userID}/${fileBatchID}/downloads/${index}.csv`)
        const exists = await cloudFile.exists()
        return exists[0] 
      }))
      .then(result => {
        return (result.includes(false) ? false : true)
      })
    }
    await expect(writeCSVFiles(consolidatedBlueprints, userID, fileBatchID)).resolves.not.toThrow()
    await expect(filesAreInCloud(consolidatedBlueprints)).resolves.toBe(true)
  })
})
  