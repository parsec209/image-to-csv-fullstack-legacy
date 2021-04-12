<template>
  <div>
    <p>
      The <strong>left anchor phrase</strong> option works by having the application scan the upload's text for the anchor phrase that you enter into the 
      <i>Search phrase or literal value</i> field (make sure this phrase strictly adheres to the application's definition of a <i>phrase</i>, see note below about 
      phrases). If the anchor phrase is found during the scan, it will then look for the first phrase in the document text that both proceeds the anchor phrase and is 
      located on the same line as the anchor phrase. If such a phrase is found, it will be extracted as the cell section value. 
      <i>Note that in an image file, text might not always appear perfectly in line with other text; however, if it looks
      like it obviously belongs on the same line, the application will almost always interpret it as such.</i>
      <br>
      <br> 
      <i>Important note: the word <strong>phrase</strong>, in the context of this application, means a single line of text consisting of characters 
      (letters, numbers, symbols) no more than one space apart from each other. A phrase ends when a character is proceeded by two or more spaces, a line break, or a page 
      break. What the application counts as single space between text in an image file is not an exact science; however, you and the application 
      will usually be in agreement.</i> 
    </p>
    <div>
      <p><strong>Example:</strong></p>
      <p>Left anchor phrase (green) and the phrase that will be extracted as your cell section value (yellow)</p>
      <b-img src="../assets/leftPhrase-doc.png" fluid alt="Fluid image"></b-img>
      <p>Notice how it is the first phrase that proceeds the anchor phrase and is on the same line. Any phrases after that first phrase are ignored.</p>
      <br>
      <p>And the anchor phrase is keyed into the form field exactly as seen in the document:</p>
      <b-img src="../assets/leftPhrase-app.png" fluid alt="Fluid image"></b-img>
    </div>
  </div>
</template>    


<script>
export default {
  name: 'InstructionsLeftPhrase',
}
</script>


<style scoped>

img {
  border: 1px solid #555;
}

</style>