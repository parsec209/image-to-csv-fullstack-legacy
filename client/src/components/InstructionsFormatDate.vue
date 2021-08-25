<template>
  <p>
    If you expect the extracted value for a cell section to be a date, and you want that date automatically formatted a certain way in the CSV file, the <strong>format date</strong> 
    field comes in handy. Any of the six case-sensitive characters in between the following brackets can be input into this field: <strong>[MDY-/,]</strong>. 
    You can also enter spaces. Below you will see some example inputs and outputs.
    <br>
    <br>
    <strong>Months:</strong>
    <br> 
    M  ----  1 2 ... 11 12
    <br>
    MM	----  01 02 ... 11 12
    <br>
    MMM	 ----  Jan Feb ... Nov Dec
    <br>
    MMMM  ----  January February ... November December
    <br>
    <br>
    <strong>Days:</strong> 
    <br>
    D	 ----  1 2 ... 30 31
    <br>
    DD  ----  01 02 ... 30 31
    <br>
    <br>
    <strong>Years:</strong>
    <br>
    Y  ----  1970 1971 ... 9999
    <br>
    YY  ----	70 71 ... 29 30
    <br>
    YYYY  ----	1970 1971 ... 2029 2030
    <br>
    <br>
    <strong>Example:</strong>
    <br>
    1) Your input in the date format field: <i>DD-MMM-YYYY</i>
    <br>
    2) The application extracts <i>Jan 2, 2020</i> (using whatever string search method and search string you selected for the recurring doc)
    <br>
    3) The final output of the cell section value in the CSV file will be <i>02-Jan-2020</i>
  </p>
</template>    


<script>
export default {
  name: 'InstructionsFormatDate'
}
</script>

