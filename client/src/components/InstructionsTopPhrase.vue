<template>
  <div>
    <p>
      The <strong>top anchor phrase</strong> option works by having the application scan the upload's text for the anchor phrase that you enter into the 
      <i>Search phrase or literal value</i> field (make sure this phrase strictly adheres to the application's definition of a <i>phrase</i>, see note below about 
      phrases). The anchor phrase can either be part of a larger phrase, or be a complete phrase by itself. If the anchor phrase is found during the scan, 
      it will then look for the phrase in the document text that is located <i>n</i> levels directly beneath the anchor phrase, and use this phrase as the cell section value. To elaborate, <i>directly beneath</i>
      in this context means that the anchor phrase and target phrase share an x-coordinate, or in other words, they overlap horizontally. Secondly, <i>n</i> levels means the
      number of phrases beneath the anchor phrase that the application will look for the target phrase, based on the phrase count you have chosen. For instance, let's say there are 
      five phrases directly beneath the anchor phrase, and each phrase is beneath the other (i.e. they are all on different lines). If you select a phrase count of five, the target value will be the fifth phrase 
      beneath the anchor phrase. Many times, a metadata field name will be located above its associated value with no other phrases in between them, which means you can keep the 
      default phrase count of one. A final caveat, your anchor phrase can sometimes have horizontal overlap with multiple phrases beneath it that exist on the 
      same line. If this is the case, only the leftmost phrase in that line would be used as the target value.
      <br>
      <br>
      <i>Note: the word <strong>phrase</strong>, in the context of this application, means a single line of text consisting of characters 
      (letters, numbers, symbols) no more than one space apart from each other. A phrase ends when a character is proceeded by two or more spaces, a line break, or a page 
      break. What the application counts as single space between text in an image file is not an exact science; however, you and the application 
      will usually be in agreement. Just remember, type a phrase into the form exactly as it appears in the document!</i> 
    </p>
    <br>
    <div>
      <p><strong>Example:</strong></p>
      <p>Top anchor phrase (green) and the phrase that will be extracted as your cell section value (yellow), if you were to select a phrase count of one.</p>
      <b-img src="../assets/topPhrase-doc.png" fluid alt="Fluid image"></b-img>
      <br>
      <br>
      <p>And the anchor phrase is keyed into the form field exactly as seen in the document:</p>
      <b-img src="../assets/topPhrase-app.png" fluid alt="Fluid image"></b-img>
      <br>
      <br>
      <br>
      <p><strong>A more complicated example:</strong></p>
      <p>Top anchor phrase (green) and the phrase that will be extracted as your cell section value (yellow), if you were to select a phrase count of three.</p>
      <p>Notice how the seven digit number is a phrase existing on the same line as another phrase, and both phrases horizontally overlap with the anchor phrase! </p>
      <p>Only the leftmost phrase will be chosen as the cell section value in cases like this.</p>
      <b-img src="../assets/topPhrase2-doc.png" fluid alt="Fluid image"></b-img>  
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