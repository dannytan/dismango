<template>
  <v-container fluid>
    <v-layout row>
      <v-flex x12><pre>{{data}}</pre></v-flex>
    </v-layout>
    <v-layout row>

      <file-base64
        v-bind:multiple="false"
        v-bind:done="setImageContent">
      </file-base64>

    </v-layout>
    <v-layout row>
      {{result}}
    </v-layout>
  </v-container>
</template>

<script>
  import axios from 'axios'
  import fileBase64 from 'vue-file-base64'

  export default {
    components: {
        fileBase64
    },
    data() {
      return {
        result: null,
        apiKey: 'AIzaSyAGlHsVmC_099jrau67fglMExpEnuG4Cds',
        data: {
          "requests": [{
            "features": [{
              "type": 'DOCUMENT_TEXT_DETECTION'
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
          axios.post(
            `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`,
            this.data).then(response => {
            this.result = response.data.responses[0].textAnnotations[0].description;
          }).catch(error => {
            console.error(error);
          })
        },
        setImageContent(file) {
            let base64 = file.base64;
            this.data.requests[0].image.content = base64.replace("data:image/png;base64,", "");
            this.process();
        },
    }
  }

</script>

<style scoped type="text/css" lang="css"></style>
