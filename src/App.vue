<template>
  <div id="app">
    <!--<img src="./assets/logo.png">
    <router-view></router-view>-->
    <home></home>
    <text-to-speech></text-to-speech>
  </div>
</template>

<script>
  import Home from './components/Home';
  import TextToSpeech from './components/TextToSpeech';

  export default {
    name: 'App',
    components: {
        Home,
        TextToSpeech
    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
