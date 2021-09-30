<template>
  <p>
    The <strong>data cells</strong>, that comprise the recurring document table rows, are subdivided into <strong>cell sections</strong>, up to a maximum of four
    for each cell. 
    Each cell section uses its own rules to find metadata values within an upload's text, and you must click the individual sections to see their rules. 
    The values retrieved for each cell section will ultimately consolidate into one cell value and be placed into that corresponding row/field in the 
    generated CSV file. 
    <br>
    <br>
    <i>Example: you have two cell sections in table cell B2, the first section extracting text "ABCD" from the upload, and the second section extracting "1234" from the upload; those 
    two lines of text will combine into a single cell value of "ABCD1234", and if you open the CSV file within a spreadsheet editor, you would see this value
    in cell B2 of the spreadsheet.</i>
    <br>
    <br>
    Up to 100 rows can be added to the table body. Note that the number of data cells within a table body row will always equal the number of header cells in the top row, so 
    adding or deleting a column means you will add or delete a cell in every row. 
  </p>
</template>    


<script>
export default {
  name: 'InstructionsDataCells'
}
</script>
                  