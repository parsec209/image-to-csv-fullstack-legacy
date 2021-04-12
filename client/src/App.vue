<template>
  <div id="app">
    <div id="content">
      <router-view/>
    </div>
    <footer id="site-footer">
      <hr>
      <div class="container">
        <small>
          Website © 2021 Ryan Galbreath.
          PDF icon by <a href="https://www.flaticon.com/authors/dinosoftlabs" title="DinosoftLabs">DinosoftLabs</a> and 
          Excel icon by <a href="https://www.flaticon.com/authors/pixel-buddha" title="Pixel Buddha">Pixel Buddha</a> 
          from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com.</a>
        </small>
      </div>
    </footer> 
  </div>
</template>


<script>
export default {
  name: 'app',
}
</script>


<style>

html, body {
  height: 100%; 
  width: 100%; 
}

body {
  background: linear-gradient(#cfecda,#fff);
  background-repeat: no-repeat;
  font-family: Arial, sans-serif;
}

#app {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

#content {
  flex-grow: 1;
}

#content, #site-footer {
  flex-shrink: 0;
}

#site-footer {
  height: 75px;   
}

</style>
