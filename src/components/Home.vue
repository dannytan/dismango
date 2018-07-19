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
        results: null,
        apiKey: 'AIzaSyAGlHsVmC_099jrau67fglMExpEnuG4Cds',
        data: {
          "requests": [{
            "features": [{
              "type": null
            }],
            "image": {
              "content": null
            }
          }]
        }
      }
    },
    methods: {
        process() {
          axios
            .get('https://api.coindesk.com/v1/bpi/currentprice.json')
            .then(response => (this.results = response.data.bpi));

          /*axios.post(
            `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`,
            this.data).then(response => {
            const result = response.data;
            console.log(result)
          }).catch(error => {
            console.log(error);
          })*/
        }
    },
    mounted () {
      this.process();
    }
  }

</script>

<style scoped type="text/css" lang="css"></style>
