<template>
  <div>
    <p>
      The <strong>ID phrase</strong> is a line of text that the application looks for within a document immediately after the document is uploaded. This is how the upload 
      is identified as one of your saved recurring documents. From there, it will then know which recurring doc rules to follow for the rest of the CSV generation process.
      Including at least one ID phrase is required, but you can optionally include a second ID phrase to narrow down the doc identification process even further. Note that
      if you do include this second phrase, the application must find BOTH phrases within the extracted document text in order for the upload to be identified as a recurring doc. 
      <br>
      <br>
      The ID phrase you use must be a single line of text found in the document consisting of characters (letters, numbers, symbols) no more than one space apart from each other.
      A phrase ends the moment it is followed by two or more spaces, or a line/page break. <i>Note that occasionally the application may not agree with you on what counts 
      as a single space in an image file; however, the vast majority of the time, it will. If it looks like a phrase, per the rules just mentioned, the application
      will almost always detect it as a phrase.</i> And make sure to type the phrase into the form exactly as it appears in the document! (i.e. single spaces in between
      words, when they exist). The phrase can come from any page of the document you decide to scan, 
      and it can even be a subset of a larger phrase (i.e. if you see a phrase "Good afternoon!" in the document, it is fine to use "ood afternoo" as your ID phrase).  
    </p>
    <div>
      <p><strong>Example:</strong></p>
      <p>Phrase from a document (single line of characters, with single spaces!):</p>
      <b-img src="../assets/IDPhrase-doc.png" fluid alt="Fluid image"></b-img>
      <br>
      <br>
      <p>Keyed exactly the same way into the form field (also with single spaces!):</p>
      <b-img src="../assets/IDPhrase-app.png" fluid alt="Fluid image"></b-img>
    </div>
    <br>
    <p>
      <i>Make sure that the ID phrase is unique enough so that there will be no ambiguity on which recurring doc an upload belongs to (i.e. using a common phrase like 
      "invoice #" is not a good idea)</i>
    </p>
  </div>
</template>    


<script>
export default {
  name: 'InstructionsDocID'
}
</script>
                  

<style scoped>

img {
  border: 1px solid #555;
}

</style>