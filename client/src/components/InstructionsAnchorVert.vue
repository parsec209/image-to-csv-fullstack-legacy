<template>
  <div>
    <p>
      An <strong>anchor phrase</strong> is a document text string that is expected to always exist in the same position relative to the text value you are seeking.
      Any string of characters you see in a document can be used as an <i>anchor phrase</i>, as long as those characters are all on the same line and they have no more
      than one space in between each other. Two or more spaces, or a line break, terminates the phrase. The anchor phrase is typed into the 
      <strong>search string</strong> form field.
    </p>
    <p>
      The <strong>vertical search method</strong> first looks for an <i>anchor phrase</i> of your choosing within the document, and once found, 
      starts counting the <i>string retrieval types</i> located directly beneath the anchor phrase, line by line,  
      until either the max <i>string count</i> is met or the bottom of the page is reached.
    </p>
    <p>The <strong>string retrieval type</strong> can be either a <i>word</i> or a <i>phrase</i>, and the <i>phrase</i> option is selected by default. 
    <p>A <strong>word</strong>, in the context of <i>string retrieval types</i>, is a group of one or more characters 
      (including special chars) on a single line, with no spaces in between them. A word terminates at a space.  
    </p>
    <p>
      A <strong>phrase</strong>, in the context of <i>string retrieval types</i>, is a group of one or more <i>words</i> on a single line, with no more than one space
      in between them, and terminates when it meets two or more spaces. 
    </p>
    <p>
      The <strong>string count</strong> is the number of <i>string retrieval types</i> to be counted directly beneath the <i>anchor phrase</i>, with a single count 
      being selected by default. <i>Directly beneath</i>, in this context, means that the <i>string retrieval type</i> horizontally overlaps with the 
      <i>anchor phrase</i>. Secondly, only the first horizontally overlapping <i>string retrieval type</i> found in a line will be 
      added to the count, and any remaining <i>string retrieval types</i> in that same line will be disregarded. The count then continues to the next line down and 
      repeats the process until the last <i>string retrieval type</i> in the count is reached, which will be used as the cell section value. An empty cell section
      value will be returned if the <i>anchor phrase</i> is invalid, not found, or if the <i>string count</i> exceeds the remaining <i>string retrieval types</i> that
      are directly beneath the <i>anchor phrase</i>.
    <p>
    <p><strong>Examples:</strong></p>
    <li>Anchor phrases are highlighted in yellow</li>
    <li>Counted string retrieval types are highlighted in orange</li>
    <li>Last string retrieval type of the count is highlighted in green, and used as the cell section value</li>
    <br>
    <p>Anchor phrase (used in scenarios 1 and 2) keyed into the search string form field:</p>
    <b-img src="../assets/anchorVert-searchString.png" fluid alt="Fluid image"></b-img>
    <br>
    <br>
    <p><strong>Scenario 1:</strong> String retrieval type: word; string count: three</p>
    <b-img src="../assets/anchorVert-word.png" fluid alt="Fluid image"></b-img>
    <br>
    <br>
    <p><strong>Scenario 2:</strong> String retrieval type: phrase; string count: three</p>
    <b-img src="../assets/anchorVert-phrase.png" fluid alt="Fluid image"></b-img>
    <br>
    <br>
    <p>Anchor phrase (used in scenarios 3 and 4) keyed into the search string form field:</p>
    <b-img src="../assets/anchorVert-searchString-embedded.png" fluid alt="Fluid image"></b-img>
    <br>
    <br>
    <p><strong>Scenario 3:</strong> String retrieval type: word; string count: three</p>
    <b-img src="../assets/anchorVert-word-embedded.png" fluid alt="Fluid image"></b-img>
    <br>
    <br>
    <p><strong>Scenario 4:</strong> String retrieval type: phrase; string count: three</p>
    <b-img src="../assets/anchorVert-phrase-embedded.png" fluid alt="Fluid image"></b-img>
    <br>
    <br>
  </div>
</template>     


<script>
export default {
  name: 'InstructionsAnchorVert'
}
</script>


<style scoped>

img {
  border: 1px solid #555;
}

</style>