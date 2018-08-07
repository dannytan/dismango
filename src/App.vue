<template>
  <div id="app">
]    <router-view></router-view>
  </div>
</template>

<script>

  export default {
    name: 'App',
    components: {}
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    color: #2c3e50;
    padding-top: 30px;
    min-height: 100vh;

    background: #ff5f6d; /* fallback for old browsers */
    background: -webkit-linear-gradient(to bottom, #ff5f6d, #ffc371); /* Chrome 10-25, Safari 5.1-6 */
    background: linear-gradient(to bottom, #ff5f6d, #ffc371); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  }
</style>
