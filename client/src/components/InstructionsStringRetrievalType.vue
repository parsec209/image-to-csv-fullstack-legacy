<template>
  <div>
    <p>
      The <strong>string retrieval type</strong> option is only applicable if you select one of the two <i>anchor phrase</i> string search methods. See the anchor phrase
      help sections for further details. It defaults to the <i>phrase</i> option. To summarize:
    </p>
    <li>A <strong>word</strong>, in the context of <i>string retrieval types</i>, is a group of one or more characters 
      (including special chars) on a single line, with no spaces in between them. A word terminates at a space.  
    </li>
    <li>
      A <strong>phrase</strong>, in the context of <i>string retrieval types</i>, is a group of one or more <i>words</i> on a single line, with no more than one space 
      in between them, and terminates when it meets two or more spaces. 
    </li>
  </div>
</template>    


<script>
export default {
  name: 'InstructionsStringRetrievalType'
}
</script>