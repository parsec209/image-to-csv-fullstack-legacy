<template>
  <div>
    <p>
      If the value you are wanting to extract has a predictable text pattern in each document (same number of digits, letters, etc.), 
      the <strong>regular expression</strong> <i>string search method</i> is an ideal choice. With this option selected, you can enter anything into the <i>search string</i> field that you can 
      normally put inside of a regular expression literal to construct a javascript regular expression. In this case, however, you only need to enter
      the pattern itself, do not include the enclosing forward slashes or any flags. The application will look for the <i>nth</i> instance of text that matches your regular expression and use that as the 
      cell section value, <i>n</i> being your selected <i>string count</i>, which defaults to the number one. An empty value will be returned under the following conditions: the string count 
      exceeds the number of matches found, 
      there were no matches found, or the matching text contains a line break or multiple spaces. If you need to search for a single white space character, enter an empty space into 
      your pattern instead of the \s in order to avoid the risk of matching a line break.
      <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Cheatsheet">Here</a> is a useful cheatsheet for javascript regular 
      expression syntax, and also <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions">this link</a>
      provides a comprehensive overview of javascript regular expressions.
      There are some common examples in the notes below to help you get started if you are not familiar with regular expressions. 
    </p>
    <ul><strong>Examples:</strong>
      <br>
      <br>
      <li>
        Search for an exact letter or number by inputting them just as they are:
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
      <li>Search for character classes (i.e. letters or numbers) by preceding specific letters with a backslash. Here are a few helpful ones: 
        <ul>
          <li>\d searches for any digit</li>
          <li>\D searches for any non-digit character</li>
          <li>\w searches for any alphanumeric character</li>
          <li>\W searches for a special character (%, $, etc.)</li>
        </ul>
        <br>
        <i>Example input:</i> \Dbcd123\d
        <br>
        <i>Will search for any of these:</i> abcd1234, bbcd1235, cbcd1236, etc...
      </li>
      <br>
      <li>Adding a <i>quantifier</i> right after an item specifies how many times to match the item. For instance, using the {n} quantifier 
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

