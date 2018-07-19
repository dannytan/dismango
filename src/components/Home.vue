<template>
  <v-container fluid>
    <v-layout row>
      <v-flex x12><pre>{{results}}</pre></v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import axios from 'axios'

  export default {
    data() {
      return {
        results: null
      }
    },
    mounted () {
      axios
        .get('https://api.coindesk.com/v1/bpi/currentprice.json')
        .then(response => (this.results = response.data.bpi))
    }
  }

</script>

<style scoped type="text/css" lang="css"></style>
