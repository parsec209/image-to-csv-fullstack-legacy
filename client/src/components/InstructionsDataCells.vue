<template>
  <p>
    The <strong>data cells</strong> within the table's body are subdivided into <strong>cell sections</strong>, up to a maximum of four, each with their own text extraction 
    rules. You must click the individual sections to see their rules. The cell sections use their rules to find metadata values within an upload, and those metadata values will ultimately 
    consolidate into one cell value and be placed into that corresponding cell in the generated CSV file. 
    <br>
    <br>
    <i>Example: you have two cell sections in table cell B2, one section extracting text "ABCD" from an upload, and the other section extracting "1234" from the same upload; those 
    two lines of text will combine into "ABCD1234", and will be placed in cell B2 of the CSV file.</i>
    <br>
    <br>
    Up to 100 rows can be added to the table body. Note that the number of data cells within a table body row will always equal the number of header cells in the top row, and 
    adding or deleting a column means you will add or delete a cell in every row. 
  </p>
</template>    


<script>
export default {
  name: 'InstructionsDataCells'
}
</script>
                  