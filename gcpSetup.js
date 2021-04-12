//Creates a GCP_CRED.json file during postbuild, which will contain the Google Cloud Platfrom API key


if (process.env.NODE_ENV === 'production') {
  const fs = require('fs')
  fs.writeFileSync('GCP_CRED.json', process.env.GCP_CRED)
  console.log('GCP_CRED.json written!');
}
