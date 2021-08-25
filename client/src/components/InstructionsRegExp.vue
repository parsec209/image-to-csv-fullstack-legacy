<template>
  <div>
    <p>
      If the value you are wanting to extract has a common text pattern in each document (same number of digits, letters, etc.), the <strong>text pattern</strong> option is
      an ideal choice. With this option selected, you will be using the <i>Search phrase or literal value</i> field to enter a <strong>regular expression</strong> to define
      the pattern used in the search. The application will look for the first piece of text in the document that matches your pattern, and use that text as the cell section
      value. So if you are using this method, and the text you are looking for is somewhere further down in the document, first make sure that no text with that same pattern
      exists before it within the document. There are some examples in the notes below to help you get started if you are not familiar with regular expressions. Also,
      <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Cheatsheet">this link</a> is a useful cheatsheet for javascript regular 
      expression syntax, and also <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions">this link</a>
      provides a comprehensive overview of javascript regular expressions. 
    </p>
    <ul><strong>Examples:</strong>
      <br>
      <br>
      <li>
        Search for letters and numbers by inputting them just as they are:
        <br>
        <br>
        <i>Example input:</i> abcd1234
        <br>
        <i>Will search for:</i> abcd1234
      </li>
      <br>
      <li>
        Search for special characters by preceding the character with a backslash:
        <br>
        <br>
        <i>Example input:</i> abcd\*12\$34
        <br>
        <i>Will search for:</i> abcd*12$34
      </li>
      <br>
      <li>Create generic searches by preceding specific letters with a backslash. Here are a few helpful ones: 
        <ul>
          <li>\d searches for a digit</li>
          <li>\D searches for any non-digit character</li>
          <li>\w searches for any alphanumeric character</li>
          <li>\s searches for a single white space</li>
          <li>\W searches for a special character (%, $, etc.)</li>
        </ul>
        <br>
        <i>Example input:</i> \Dbcd123\d
        <br>
        <i>Will search for any of these:</i> abcd1234, bbcd1235, cbcd1236, etc...
      </li>
      <br>
      <li>Add a <i>quantifier</i> right after a search item to search for that item a certain number of times. For instance, using the {n} quantifier 
        searches the preceeding item 'n' times.
        <br>
        <br>
        <i>Example input:</i> \d{3}
        <br>
        <i>Will search for any digit three times, which can be any of these:</i> 123, 987, 425, etc...
      </li>
    </ul>
  </div>
</template>    


<script>
export default {
  name: 'InstructionsRegExp'
}
</script>

