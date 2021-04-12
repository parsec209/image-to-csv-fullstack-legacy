<template>
  <p>
    <strong>Header cell values</strong> are fixed field names that describe the variable data in each column of a CSV file. Every recurring document must include a header, 
    and that header's values will be used in every CSV file that is generated from that recurring document's extraction rules. In order to associate a header with a recurring 
    doc, you have two options: 1) save a header by itself on the <b-link to="/index/header">My headers</b-link> page and reuse it later when setting up a recurring document 
    (useful if you plan to reuse the same header in multiple recurring docs), or 2) you can just enter header cell values directly into the table on a recurring document setup page. 
    <br>
    <br>
    There can be no empty header cell values, nor duplicate header cell values, within a table. The row length can range from one to 52 cells, and can be adjusted with the 
    <i>Add Column</i> and <i>Delete Column</i> buttons. 
  </p>
</template>    


<script>
export default {
  name: 'InstructionsHeaderCells'
}
</script>
                  