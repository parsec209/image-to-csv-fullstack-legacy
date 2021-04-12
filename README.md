# Image-To-CSV

Performs OCR on document images and generates CSV files from the extracted metadata. Rules are configured by the user to control what field names and 
metadata values will populate the CSV files. Ideal for sets of documents that are received regularly and that have consistent formatting.  

## Demo  

You can check out a working UI for the application here: https://imagetocsv.herokuapp.com/. However, registering an account on that domain is by invitation only. 

## Quick Start

There are some third party services you will have to be setup with for this application to work, which you will see in the .sample-env. Some of the services can be substituted
with a small amount of tweaking (i.e. the logger and email services), but the application is heavily dependent on the Google Cloud Platform (Vision and Storage APIs).

```bash
# Install server dependencies
npm install

# Add environment variables
<See .sample-env in project root>

# Start Express server: http://localhost:3000
cd server
npm run dev

# Run server-side tests
cd server
npm test

# Install client dependencies
cd client
npm install

# Add Sentry DSN and hostname env vars
cd client
<See .sample-env in client folder>

# Start Vue dev server: http://localhost:8080
cd client
npm run serve

# Production build (Builds into server/public. If public folder already exists, will override any previous builds)
cd client
npm run build
```

## App Info

### Author

Ryan Galbreath

### Version

1.0.0

### License

Apache Version 2.0