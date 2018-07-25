<template>
  <v-container fluid>
    <!--<h1>TiSK</h1>-->

    <v-layout row>
      <div class="wrapper">
        <div class="drop">
          <div class="cont">
            <!--<v-icon>cloud_upload</v-icon>-->
            <div class="tit">
              Drag & Drop
            </div>
            <div class="desc">
              your files to Assets, or
            </div>
            <div class="browse">
              click here to browse
            </div>
          </div>
          <input id="files" multiple="true" name="files[]" type="file" />
        </div>
      </div>
    </v-layout>

    <!--<v-layout row>
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
    </v-layout>-->

    <div class="root" v-if="allImgFiles.length > 0">
      <SortableList lockAxis="y" v-model="allImgFiles">
        <SortableItem v-for="(file, index) in allImgFiles" :index="index" :key="index"
                      :item="file.name"></SortableItem>
      </SortableList>
    </div>
  </v-container>
</template>

<script>
  import axios from 'axios'
  import {ContainerMixin, ElementMixin} from 'vue-slicksort';

  const SortableList = {
    mixins: [ContainerMixin],
    template: `<ul class="list"><slot /></ul>`,
  };

  const SortableItem = {
    mixins: [ElementMixin],
    props: ['item'],
    template: `<li class="list-item">{{item}}</li>`,
  };

  export default {
    components: {
      SortableList,
      SortableItem
    },
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
        filteredText: null,
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
  // TODO - Move styles to separate file
  @import url(https://fonts.googleapis.com/css?family=Montserrat:400,700);
  *,
  *:before,
  *:after {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  body,
  html {
    font-family: "Montserrat", sans-serif;
    font-size: 100%;
    font-weight: 400;
    background: white;
    color: #323a44;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  input:focus,
  select:focus,
  textarea:focus,
  button:focus {
    outline: none;
  }

  .wrapper {
    width: 100%;
    height: 100%;
  }

  .drop {
    width: 96%;
    height: 96%;
    border: 3px dashed #DADFE3;
    border-radius: 15px;
    overflow: hidden;
    text-align: center;
    background: white;
    -webkit-transition: all 0.5s ease-out;
    -moz-transition: all 0.5s ease-out;
    transition: all 0.5s ease-out;
    margin: auto;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    /*&:hover
     * cursor: pointer
     * background: #f5f5f5 */
  }
  .drop .cont {
    width: 500px;
    height: 170px;
    color: #8E99A5;
    -webkit-transition: all 0.5s ease-out;
    -moz-transition: all 0.5s ease-out;
    transition: all 0.5s ease-out;
    margin: auto;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
  .drop .cont i {
    font-size: 400%;
    color: #8E99A5;
    position: relative;
  }
  .drop .cont .tit {
    font-size: 400%;
    text-transform: uppercase;
  }
  .drop .cont .desc {
    color: #A4AEBB;
  }
  .drop .cont .browse {
    margin: 10px 25%;
    color: white;
    padding: 8px 16px;
    border-radius: 5px;
    background: #09f;
  }
  .drop input {
    width: 100%;
    height: 100%;
    cursor: pointer;
    background: red;
    opacity: 0;
    margin: auto;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }
  .drop .thumb {
    height: 75px;
    border: 1px solid #323a44;
    margin: 10px 5px 0 0;
  }

</style>
