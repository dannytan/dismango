<template>
  <v-container fluid>
    <!--<h1>TiSK</h1>-->
    <v-layout row>
      <input type="file"
             ref="image"
             accept="image/*"
             multiple="true"
             @change="processImages"/>
    </v-layout>
    <v-layout row>
      {{ filteredText }}
    </v-layout>
    <v-layout row>
      <v-btn @click="pause">Pause</v-btn>
      <v-btn @click="play">Play</v-btn>
      <v-btn @click="cancel">Cancel</v-btn>
    </v-layout>
  </v-container>
</template>

<script>
  import axios from 'axios'

  export default {
    data() {
      return {
        result: null,
        apiKey: 'AIzaSyAGlHsVmC_099jrau67fglMExpEnuG4Cds',
        data: {
          "requests": []
        },
        isLoading: true,
        msg: '',
        selectedVoice: 0,
        synth: window.speechSynthesis,
        voiceList: [],
        utterThis: new window.SpeechSynthesisUtterance(),
        base64: null,
        allImgFiles: [],
        convertedText: '',
        filteredText: null
      }
    },
    methods: {
      processImages(e) {
        const files = e.target.files;
        let imgFiles = [];
        for (let i = 0; i < files.length; i++) {
          let file = files[i];
          const fr = new FileReader();
          if (file !== undefined) {
            fr.readAsDataURL(file);

            fr.onload = () => {
              let fileInfo = {
                name: file.name,
                type: file.type,
                size: Math.round(file.size / 1000) + ' kB',
                base64: this.convertToBase64(fr.result, file.type),
                file: file
              };

              imgFiles.push(fileInfo);

              let request = {
                "features": [{
                  "type": 'DOCUMENT_TEXT_DETECTION'
                }],
                "image": {
                  "content": null
                }
              };
              this.data.requests.push(request);

              if (imgFiles.length === files.length) {
                this.allImgFiles = imgFiles;
              }
            }
          }
        }
      },
      // TODO - Check order of processing with multiple files.
      convertToText() {
        axios.post(
          `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`,
          this.data).then(response => {
          this.result = response.data.responses;
          for (let i = 0; i < this.result.length; i++) {
            this.convertedText += this.result[i].textAnnotations[0].description + " ";
          }
          this.filteredText = this.filterText(this.convertedText);
        }).catch(error => {
          console.error(error);
        })
      },
      //currently supports png and jpeg, can add more later
      convertToBase64(str, fileType){
        if (fileType === 'image/png') {
          return str.replace("data:image/png;base64,", "");
        } else if (fileType === 'image/jpeg') {
          return str.replace("data:image/jpeg;base64,", "");
        }
      },
      buildRequests(images) {
        for (let i = 0; i < images.length; i++) {
          this.data.requests[i].image.content = images[i].base64;
        }

        // TODO - Uncomment to run conversion
        //this.convertToText();
      },
      listenForSpeechEvents () {
        this.utterThis.onstart = () => {
          this.isLoading = true
        };

        this.utterThis.onend = () => {
          this.isLoading = false
        }
      },
      filterText(str) {
        return str.replace(/(?:-\n|- )/g, '');
      },
      read() {
        //console.log("Rate: " + this.utterThis.rate + ", Pitch: " + this.utterThis.pitch);
        this.utterThis.text = this.filteredText;
        this.utterThis.voice = this.voiceList[this.selectedVoice];
        this.synth.speak(this.utterThis);
      },
      pause() {
        console.log("paused");
        this.synth.pause();
      },
      play() {
        console.log("play");
        this.synth.resume();
      },
      cancel() {
        console.log("cancel");
        this.synth.cancel();
        this.result = null;
      },
    },
    mounted () {
      //speechSynthesis.speak(new SpeechSynthesisUtterance("Check check one two."));

      this.voiceList = this.synth.getVoices();
      if (this.voiceList.length) {
        this.isLoading = false
      }
      this.synth.onvoiceschanged = () => {
        this.voiceList = this.synth.getVoices();
        setTimeout(() => {
          this.isLoading = false
        }, 800)
      };

      this.listenForSpeechEvents();
    },
    watch: {
      allImgFiles() {
        this.buildRequests(this.allImgFiles);
      },
      filteredText() {
        if (this.filteredText) {
          this.read();
        }
      }
    }
  }

</script>

<style scoped type="text/scss" lang="scss">

</style>
