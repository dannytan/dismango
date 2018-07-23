<template>
  <v-container fluid>
    <!--<h1>TsK</h1>-->
    <v-layout row>
      <file-base64
        v-bind:multiple="false"
        v-bind:done="setImageContent">
      </file-base64>
      <input type="file"
             ref="image"
             accept="image/*"
             multiple="true"
             @change="processImages"/>
    </v-layout>
    <v-layout row>
      {{result}}
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
          "requests": []
        },
        exampleText: "Having clarified my vantage point, I make a statement of the obvious- that views held by those in dominant positions about their subordinates could have significant consequences for people's self-image and for the ways they cope with their situations. Such views, which are often deroga- tory and belittling, are integral to most relationships of dominance and subordination, wherein superiors behave in ways or say things that are accepted by their inferiors, who in turn behave in ways that serve to per- petuate the relationships. In Oceania, derogatory and belittling views of indigenous cultures are traceable to the early years of interactions with Europeans. The wholesale condemnation by Christian missionaries of Oceanic cultures as savage, lascivious, and barbaric has had a lasting and negative effect on people's views of their histories and traditions. In a number of Pacific societies peo- ple still divide their history into two parts: the era of darkness associated with savagery and barbarism; and the era of light and civilization ushered in by Christianity.",
        isLoading: true,
        msg: '',
        selectedVoice: 0,
        synth: window.speechSynthesis,
        voiceList: [],
        utterThis: new window.SpeechSynthesisUtterance(),
        base64: null
      }
    },
    methods: {
      processImages(e) {
        const files = e.target.files;
        let imgFiles = [];
        let pending = 0;
        for (let i = 0; i < files.length; i++) {
          let file = files[i];
          const fr = new FileReader();
          if (file !== undefined) {
            fr.readAsDataURL(file);
            fr.addEventListener('load', () => {
              imgFiles.push(this.convertToBase64(fr.result, file.type));
              --pending;
              if(pending === 0) {
                this.buildRequests(imgFiles);
              }
            });
          }
          ++pending;
        }

      },
      processImage() {
        axios.post(
          `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`,
          this.data).then(response => {
          this.result = response.data.responses[0].textAnnotations[0].description;
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
        let request = {
          "features": [{
            "type": 'DOCUMENT_TEXT_DETECTION'
          }],
          "image": {
            "content": null
          }
        };
        for(let i = 0; i < images.length; i++) {
          request.image.content = images[i];
          this.data.requests.push(request);
        }
      },
      setImageContent(file) {

        let fileReader = new FileReader();
        let base64;
        // Onload of file read the file content
        fileReader.onload = function (fileLoadedEvent) {
          console.log(fileLoadedEvent);
          base64 = fileLoadedEvent.target.result;
          // Print data in console
          console.log(base64);
        };
        // Convert data to base64
        //fileReader.readAsDataURL(file);


        /* let base64 = file.base64;
         this.data.requests[0].image.content = base64.replace("data:image/png;base64,", "");*/
        //this.processImage();
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
        return str.replace(/- /g, '');
      },
      read() {
        //console.log("Rate: " + this.utterThis.rate + ", Pitch: " + this.utterThis.pitch);
        this.result = this.filterText(this.result);
        this.utterThis.text = this.result;
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
      result() {
        if (this.result) {
          this.read();
        }
      }
    }
  }

</script>

<style scoped type="text/css" lang="css"></style>
