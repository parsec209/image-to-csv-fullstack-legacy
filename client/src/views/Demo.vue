<template>
  <div>
    <Navbar/>
    <br>
    <div class="container">
      <br>
      <b-card header-tag="header">
        <template #header>
          <div class="text-center">  
            <h3>To demonstrate...</h3>
          </div>
        </template>
        <br>
        <p>Let's assume that you receive the monthly invoice shown below. <br> 
        It's from the same vendor, the format is predictable, and the metadata field names are the same every time. <br>
        The only things that change from invoice to invoice are the metadata values.  <br>  
        Wouldn't it be convenient to just upload the file into an application, and automatically output the highlighted values:</p>
        <br>
        <div id="invoice">
          <b-img src="../assets/demoInvoice.png" fluid alt="Fluid image"></b-img>
        </div>
        <br>
        <br>
        <p>Into a CSV file like this?</p>
        
        <b-img src="../assets/demoCSV.png" fluid alt="Fluid image"></b-img>
        <br>
        <br>
        <br>
        <p>Not only would the application need to perform OCR on the document image, but it would also need to  
          know which specific bits of text, from that specific upload, to put into those specific cells of a CSV file (it is assumed you will be 
          opening the CSV file in a spreadsheet editor).
        </p>
        <br>
        <p><strong>Setting up <i>recurring document</i> rules makes all this possible! A more in-depth example will clarify how this works:</strong></p>
        <br>
        <p>Let's say you currently work with 50 total vendors. 40 of them each send you two invoices monthly, and the two invoices are for the same service and formatted identically to 
          each other. 
          The other ten vendors each send you two invoices monthly, but the two invoices are for different services and thus formatted differently from each other.</p>
        <p>That totals 100 invoices received monthly (50 vendors x 2 invoices), with 60 uniquely-formatted invoices (40 x 1 unique invoice + 10 x 2 unique invoices)</p>
        <p>You can setup extraction rules in this application for each uniquely-formatted invoice, which are called <i>recurring documents</i>. This will tell the application 
          how to identify an invoice you upload as one of your recurring docs, how it will go about finding your desired metadata within the extracted text 
          (more detail on that in the instructions), and  where it will place the metadata in the generated CSV file.
        </p>
        <p>Yes, that is 60 recurring documents you must setup, and at first, this may seem like more work than it's worth! Wouldn't inputting the rules for one recurring doc 
          take at least as long as manually keying a single invoice??</p>
        <p>Well...yes, the very first month it would. But if you expect to see these invoices every month moving forward, all you will have to do in the future is upload these invoices 
          into the application to get a downloadable CSV file, with all your desired invoice metadata already placed in the desired cells!
        </p>
        <p>One more thing you may be thinking though, what happens when a vendor pulls a fast one and changes the format of the invoice? What if I didn't open the invoice to check if 
          this was the case before I uploaded it, and now the generated CSV file has all the wrong data??
        </p>
        <p>Yes, this will happen sometimes, and you will have to setup a new recurring document for the newly-formatted invoice. And of course you will just have to discard the incorrect
          CSV file when you double check everything (OCR output, after all, is fantastic but not always perfect, so you should be double checking it anyway!) But how often will vendors be changing their invoice formatting? Not often enough
          to outweigh the benefit of all the invoices you didn't, and won't later, have to key!</p>
        <br>
        <br>
        
        <h5 class="text-center">Here you can see the main steps in action:</h5>
        <br>
        <b-row>
          <b-col md="10" offset-md="1">
            <br>
            <p><strong>1) Creating a reusable CSV header</strong></p>
              <ul>
                <li>You choose ahead of time which field names to put into the CSV file headers (these are not extracted from the document text)</li>
                <li>You may want the same headers for many of your recurring docs, so these can be saved for reuse</li>
              </ul>
            <br>
            <br>
            <b-embed
            type="video"
            controls
            aspect="21by9"
              src="../assets/demoHeader.mp4"
            ></b-embed>
            <br>
            <br>
            <br>
            <br>
            <br>
            <p><strong>2) Setting up a recurring document</strong></p>
              <ul>
                <li>These are the rules that tell the application how to recognize a certain upload as a recurring document, how to find the document text that you want to put into your CSV file, 
                  and which cells to place the text into</li>
                <li>Cells are divided into cell sections, and each section has its own rules for retrieving the data that will be placed into the corresponding cell of the CSV file (i.e. see the section values of cell E2 in the video)</li>
                <li>You can set rules to find specific text based on position (an "anchor phrase" that is always located in the same position relative to a metadata value), 
                  or you can use regular expressions to find text (i.e. text pattern of a metadata value)</li>
                <li>You can also fill cells with values not related to the document text (i.e. custom values, today's date, or just keep a cell empty) 
                <li>Add garnishments to the cell values (i.e. date formatting, as seen in cell B2 in the video, or character appendage to cell section values, as seen with the hyphen in cell E2)</li>
              </ul>
            <br>
            <br>
            <b-embed
            type="video"
            controls
            aspect="21by9"
              src="../assets/demoRecurringDoc.mp4"
            ></b-embed>
            <br>
            <br>
            <br>
            <br>
            <br>
            <p><strong>3) Generating a CSV file from an upload</strong></p>
              <ul>
                <li>After your recurring docs are setup, just upload a file that you know the application will recognize as one of your recurring docs, and wait for a zip containing the 
                  CSV files to download!</li>
                <li>Up to ten files can be uploaded at once, and they can all be for different recurring documents</li>
                <li>Recurring docs that share the same header will have their data output in the same CSV file, and the data rows will be grouped per recurring doc;
                  otherwise, the data from these docs will be in separate CSV files 
                </li> 
                <li>New recurring doc rules would need to be setup only when there are changes to a document (different formatting, etc.)</li>
                <li><i>Importing and opening the CSV file in Google Sheets, starting at 0:23 in the video, is just to demonstrate how the data appears in a spreadsheet, and is 
                  not actually part of the Image-To-CSV application</i></li>
              </ul>
            <b-embed
            type="video"
            controls
            aspect="16by9"
              src="../assets/demoUpload.mp4"
            ></b-embed>
          </b-col>
        </b-row>
      </b-card>
    </div>
  </div>
</template>


<script>
import Navbar from '../components/Navbar.vue'


export default {
  name: 'Demo',
  components: {
    Navbar
  },
  data() {
    return {}
  },
  methods: {},
  mounted() {}
}
</script>


<style scoped>

img {
  border: 1px solid #555;
}

#invoice {
  border: none
}

</style>