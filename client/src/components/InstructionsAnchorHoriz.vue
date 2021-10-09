<template>
  <div>
    <p>The <strong>horizontal search method</strong> first looks for an <i>anchor phrase</i> of your choosing within the document, and once found, starts counting 
      the <i>string retrieval types</i> located after the anchor phrase (in an intuitive left to right, line by line order) until either the max <i>string count</i> is met or the 
      page ends. 
    </p>
    <InstructionsAnchorPhrase/>
    <p>The <strong>string retrieval type</strong> can be either a <i>word</i> or a <i>phrase</i>, and the <i>phrase</i> option is selected by default. 
    <p>A <strong>word</strong>, in the context of <i>string retrieval types</i>, is a group of one or more characters 
      (including special chars) on a single line, with no spaces in between them. A word terminates at a space.  
    </p>
    <p>
      A <strong>phrase</strong>, in the context of <i>string retrieval types</i>, is a group of one or more <i>words</i> on a single line, with no more than one space in between them, 
      and terminates when it meets two or more spaces. 
    </p>
    <p>
      The <strong>string count</strong> is the number of <i>string retrieval types</i> to be counted after the <i>anchor phrase</i>, with a single count 
      being selected by default. When the max count is met, the current <i>string retrieval type</i> in the count will be used as the cell section value. An empty 
      cell section value will be returned if the <i>anchor phrase</i> is invalid, not found, or if the <i>string count</i> exceeds the remaining <i>string retrieval types</i> 
      on the page.
    </p>
    <p><strong>Examples:</strong></p>
    <li>Anchor phrases are highlighted in yellow</li>
    <li>Counted string retrieval types are highlighted in orange</li>
    <li>Last string retrieval type of the count is highlighted in green, and used as the cell section value</li>
    <br>
    <p>Anchor phrase (used in scenarios 1 and 2) keyed into the search string form field:</p>
    <b-img src="../assets/anchorHoriz-searchString.png" fluid alt="Fluid image"></b-img>
    <br>
    <br>
    <p><strong>Scenario 1:</strong> String retrieval type: word; string count: six</p>
    <b-img src="../assets/anchorHoriz-word.png" fluid alt="Fluid image"></b-img>
    <br>
    <br>
    <p><strong>Scenario 2:</strong> String retrieval type: phrase; string count: three</p>
    <b-img src="../assets/anchorHoriz-phrase.png" fluid alt="Fluid image"></b-img>
    <br>
    <br>
    <p>Anchor phrase (used in scenarios 3 and 4) keyed into the search string form field:</p>
    <b-img src="../assets/anchorHoriz-searchString-embedded.png" fluid alt="Fluid image"></b-img>
    <br>
    <br>
    <p><strong>Scenario 3:</strong> String retrieval type: word; string count: six</p>
    <b-img src="../assets/anchorHoriz-word-embedded.png" fluid alt="Fluid image"></b-img>
    <br>
    <br>
    <p><strong>Scenario 4:</strong> String retrieval type: phrase; string count: three</p>
    <b-img src="../assets/anchorHoriz-phrase-embedded.png" fluid alt="Fluid image"></b-img>
    <br>
    <br>
  </div>
</template>    


<script>
import InstructionsAnchorPhrase from '../components/InstructionsAnchorPhrase.vue'

export default {
  name: 'InstructionsAnchorHoriz',
  components: {
    InstructionsAnchorPhrase
  }
}
</script>


<style scoped>

img {
  border: 1px solid #555;
}

</style>