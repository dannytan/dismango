<template>
  <v-container fluid>
    <!--<h1>TsK</h1>-->
    <v-layout row>
      <file-base64
        v-bind:multiple="false"
        v-bind:done="setImageContent">
      </file-base64>
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
          "requests": [{
            "features": [{
              "type": 'DOCUMENT_TEXT_DETECTION'
            }],
            "image": {
              "content": null
            }
          }]
        },
        exampleText: "Having clarified my vantage point, I make a statement of the obvious- that views held by those in dominant positions about their subordinates could have significant consequences for people's self-image and for the ways they cope with their situations. Such views, which are often deroga- tory and belittling, are integral to most relationships of dominance and subordination, wherein superiors behave in ways or say things that are accepted by their inferiors, who in turn behave in ways that serve to per- petuate the relationships. In Oceania, derogatory and belittling views of indigenous cultures are traceable to the early years of interactions with Europeans. The wholesale condemnation by Christian missionaries of Oceanic cultures as savage, lascivious, and barbaric has had a lasting and negative effect on people's views of their histories and traditions. In a number of Pacific societies peo- ple still divide their history into two parts: the era of darkness associated with savagery and barbarism; and the era of light and civilization ushered in by Christianity.",
        isLoading: true,
        msg: '',
        selectedVoice: 0,
        synth: window.speechSynthesis,
        voiceList: [],
        utterThis: new window.SpeechSynthesisUtterance()
      }
    },
    methods: {
      processImage() {
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
        this.processImage();
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
        if(this.result){
          this.read();
        }
      }
    }
  }

</script>

<style scoped type="text/css" lang="css"></style>
