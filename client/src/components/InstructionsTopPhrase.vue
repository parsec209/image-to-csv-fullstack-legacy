<template>
  <div>
    <p>
      The <strong>top anchor phrase</strong> option works by having the application scan the upload's text for the anchor phrase that you enter into the 
      <i>Search phrase or literal value</i> field (make sure this phrase strictly adheres to the application's definition of a <i>phrase</i>, see note below about 
      phrases). If the anchor phrase is found during the scan, it will then look for the first phrase in the document text that is located directly beneath the anchor phrase. 
      <i>Directly beneath</i> here means that at some point, these two phrases share the same horizontal (x) coordinate. If such a phrase is found, 
      it will be extracted as the cell section value. 
      <br>
      <br>
      <i>Important note: the word <strong>phrase</strong>, in the context of this application, means a single line of text consisting of characters 
      (letters, numbers, symbols) no more than one space apart from each other. A phrase ends when a character is proceeded by two or more spaces, a line break, or a page 
      break. What the application counts as single space between text in an image file is not an exact science; however, you and the application 
      will usually be in agreement.</i> 
    </p>
    <div>
      <p><strong>Example:</strong></p>
      <p>Top anchor phrase (green) and the phrase that will be extracted as your cell section value (yellow)</p>
      <b-img src="../assets/topPhrase-doc.png" fluid alt="Fluid image"></b-img>
      <p>Notice how it is the first phrase directly beneath the anchor phrase. Any further phrases after that are ignored</p>
      <br>
      <p>And the anchor phrase is keyed into the form field exactly as seen in the document:</p>
      <b-img src="../assets/topPhrase-app.png" fluid alt="Fluid image"></b-img>
    </div> 
  </div>
</template>    


<script>
export default {
  name: 'InstructionsTopPhrase'
}
</script>


<style scoped>

img {
  border: 1px solid #555;
}

</style>