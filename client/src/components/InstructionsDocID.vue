<template>
  <div>
    <p>
      The <strong>ID phrase</strong> is a line of text that the application looks for within a document immediately after the document is uploaded. This is how the upload 
      is identified as one of your saved recurring documents. From there, it will then know which recurring doc rules to follow for the rest of the CSV generation process.
      <br>
      <br>
      The ID phrase you use must be a single line of text in the document consisting of characters (letters, numbers, symbols) no more than one space apart from each other, 
      and must be typed into the form field exactly as such. A phrase ends the moment a character is followed by two or more spaces, or a line/page break. The phrase can come 
      from any page of the document that you select to scan. <i>Note that what counts as single space between text in an image file is not an exact science; however, you and the
      application will usually be in agreement.</i>
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