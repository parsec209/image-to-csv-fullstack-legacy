<template>
  <p>
    Enter the pages you want to scan for all of your uploads into the <strong>scan pages</strong> field in the main upload page. These are the pages of the uploads that you expect to contain the 
    ID phrases, anchor phrases, etc. that you setup ealier in your recurring documents.  Up to five pages can be scanned per upload, and the pages must be 
    entered exactly into the field in this format: 1, 3, -1, -2. Use negative numbers if you need to count backward from
    the last page of an upload, which starts at -1 (second to last page is -2, etc...). Valid page number ranges include positive or negative 1-99.  If you enter a 
    duplicate page number, or a page number outside of an upload's page range, the application will just ignore those pages for that particular upload and continue the scan; however, 
    at least one valid page selection must exist for every upload in the batch, or else the scan will terminate with an error message. 
    <br>
    <br>
    At the end of the scan, if at least one upload in the batch had an ID phrase that matched one from a recurring document, and no errors were encountered during the scan, a 
    zip file containing the generated CSV files will be available in your browser for download. <i>If you have multiple recurring documents that share the same header, 
    the data rows generated from those recurring docs will be consolidated into one CSV file; otherwise, there will be a CSV file for every unique header.</i> Lastly, if there were 
    any text values that the application could not find using a given recurring doc rule, that corresponding cell section in the CSV file will be empty.  
  </p>
</template>    


<script>
export default {
  name: 'InstructionsUploads'
}
</script>