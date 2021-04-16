<template>
  <div>
    <p>
      The <strong>left anchor phrase</strong> option works by having the application scan the upload's text for the anchor phrase that you enter into the 
      <i>Search phrase or literal value</i> field (make sure this phrase strictly adheres to the application's definition of a <i>phrase</i>, see note below about 
      phrases). The anchor phrase can either be a subset of a larger phrase, or be a complete phrase by itself. If the anchor phrase is found during the scan, the application has 
      three possible courses it can take for extracting the cell section value: 1) If the anchor phrase is a complete phrase by itself, the first phrase in the document text 
      that both proceeds the anchor phrase, and is located on the same line as the anchor phrase, will have its text extracted as the cell section value 2) If the anchor phrase 
      is a subset of a larger phrase, and there are characters proceeding the anchor phrase within the larger phrase, those proceeding characters will be extracted as the cell 
      section value 3) If the anchor phrase is a subset of a larger phrase, but there are no characters proceeding the anchor phrase within the larger phrase, the application 
      will follow the same path as in course #1. 
      <br>
      <br> 
      <i>The word <strong>phrase</strong>, in the context of this application, means a single line of text consisting of characters 
      (letters, numbers, symbols) no more than one space apart from each other. A phrase ends when a character is proceeded by two or more spaces, a line break, or a page 
      break. What the application counts as single space between text in an image file is not an exact science; however, you and the application 
      will usually be in agreement. Just remember, type a phrase into the form exactly as it appears in the document!</i> 
      <br>
      <br>
      <i>Also note that in an image file, text might not always appear perfectly in line with other text; however, if it looks
      like it obviously belongs on the same line, the application will almost always interpret it as such.</i>
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