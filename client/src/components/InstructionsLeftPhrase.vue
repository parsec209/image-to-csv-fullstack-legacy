<template>
  <div>
    <p>
      To understand how the <strong>left anchor phrase</strong> works, it helps to give a brief overview of how the document's text is sorted behind the scenes, right after the 
      OCR process is run. First, the extracted text body is broken down into an array of phrases. Next, by using coordinates obtained during the OCR process, 
      these phrases are sorted the exact same way you would read text on a page.
      Sorting order is prioritized by phrases that appear to be on the same line as each other (left to right), 
      followed by repeating the same process for the next line down, until the page ends. So what the left anchor phrase option does is parse through this array
      of phrases, in order, for the anchor phrase that you entered into the <i>Search phrase or literal value</i> field (make sure this phrase strictly adheres to the 
      application's definition of a <i>phrase</i>, and is entered into the form exactly as such. See note further down below about phrases). 
      If the anchor phrase is found within said array, the app will then go one by one through each consecutive phrase in the array based on your entered phrase count. Whichever
      phrase is reached at the phrase count cutoff will be used as the cell section value. 
      <br>
      <br>
      One caveat, however, is how the application determines which phrase in the array 
      will be used as the first phrase count. This depends on whether the anchor phrase you entered is part of a larger phrase, or is a complete phrase by itself (yes, 
      you are allowed to enter a partial phrase, because a partial phrase is still technically a phrase, per the application rules). There are three scenarios for obtaining the first phrase in the count: 
      1) If the anchor phrase is a complete phrase by itself, the first count starts at the next complete phrase in the array.  2) If the anchor phrase is part of a larger phrase, and 
      there are characters proceeding the anchor phrase within the larger phrase, those proceeding characters will be used as the first phrase count. 3) If the anchor phrase is part of a larger phrase, but there are no characters proceeding the anchor phrase within the 
      larger phrase, the first count starts at the next complete phrase in the array. So just remember, whatever you enter for the phrase count, 
      that will be the additional number of phrases that will be parsed in the array, taking into account the special circumstance for the first count. Many times, a metadata field name will be located directly to the 
      left of its value (hence the name "left" anchor phrase), which means you often won't even need to change the default phrase count of one. But the phrase count does 
      offer the flexibility to obtain a target phrase located anywhere in the document after the anchor phrase, if the need arises. 
      <br>
      <br> 
      <i>The word <strong>phrase</strong>, in the context of this application, means a single line of text consisting of characters 
      (letters, numbers, symbols) no more than one space apart from each other. A phrase ends when a character is proceeded by two or more spaces, a line break, or a page 
      break. What the application counts as single space between text in an image file is not an exact science; however, you and the application 
      will usually be in agreement. Just remember, type a phrase into the form exactly as it appears in the document!</i> 
      <br>
      <br>
      <i>Also note that in an image file, text might not always appear perfectly in line with other text, especially if the image quality has been altered; however, if it looks
      like it obviously belongs on the same line, the application will almost always interpret it as such.</i>
    </p>
    <br>
    <div>
      <p><strong>Example:</strong></p>
      <p>Your left anchor phrase (green), and the phrase that will be used as your cell section value (yellow), if you used the default phrase count of one.
        This image snippet contains six phrases, and it would look something like this in a sorted array. Each complete phrase is separated by a comma:
      </p>
      <pre>[ Payment Terms:,  Net 30 Days,  Date:,  01/01/2021,  Customer#:,  0035 ]</pre>  
      <p>Your target value would be "Net 30 Days" because it is one phrase ahead of the anchor phrase in the array.</p>
      <b-img src="../assets/leftPhrase-doc.png" fluid alt="Fluid image"></b-img>
      <br>
      <br>
      <p>And the anchor phrase is keyed into the form field exactly as seen in the document, including the single space between the words:</p>
      <b-img src="../assets/leftPhrase-app.png" fluid alt="Fluid image"></b-img>
      <br>
      <br>
      <br>
      <p><strong>A more complicated example:</strong></p>
      <p>Here the left anchor phrase (green) is part of a larger phrase (note the single space between "Payment" and "Terms:", so those words together make up a phrase). 
        You enter a phrase count of six, so the yellow-highlighted value will be your target value.
        "Terms:" will be the first phrase count, since it is the remainder of the same phrase encompassing the anchor phrase.
        Then count five more complete phrases after that (left to right per line, then down to the next line) and you get the yellow-highlighted value!
      </p>
      <b-img src="../assets/leftPhrase2-doc.png" fluid alt="Fluid image"></b-img>
      <br>
      <br>
      <p>Again, the anchor phrase is keyed into the form field exactly as it appears in the document:</p>
      <b-img src="../assets/leftPhrase2-app.png" fluid alt="Fluid image"></b-img>
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