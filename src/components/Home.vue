<template>
  <v-container fluid>
    <!--<h1>TiSK</h1>-->

    <v-layout row justify-center>
      <v-btn fab dark large @click="read" class="read-btn">
        <v-icon dark x-large color="white">play_arrow</v-icon>
      </v-btn>
      <v-btn fab dark large @click="pause" class="pause-btn">
        <v-icon dark x-large>pause</v-icon>
      </v-btn>
      <v-btn fab dark large @click="play" class="play-btn">
        <v-icon dark x-large>play_arrow</v-icon>
      </v-btn>
      <v-btn fab dark large @click="cancel" class="cancel-btn">
        <v-icon dark x-large>stop</v-icon>
      </v-btn>
    </v-layout>

    <v-jumbotron>
      <v-container fill-height>
        <v-layout align-center>
          <v-flex text-xs-center>
            <div class="drop">
              <div class="cont">
                <v-icon>cloud_upload</v-icon>
                <div class="tit">
                  Drag & Drop
                </div>
                <div class="desc">
                  your files, or
                </div>
                <div class="browse">
                  click here to browse
                </div>
              </div>
              <input id="files"
                     multiple="true"
                     type="file"
                     accept="image/*"
                     @change="processImages"/>
            </div>
          </v-flex>
        </v-layout>
      </v-container>
    </v-jumbotron>

    <v-layout row>
      {{ filteredText }}
    </v-layout>

    <v-layout justify-center>
      <div v-if="allImgFiles.length > 0" class="list-wrapper">
        <v-btn block color="red darken-1" class="clear-btn" @click="clearList">Clear</v-btn>
        <SortableList lockAxis="y" v-model="allImgFiles">
          <SortableItem v-for="(file, index) in allImgFiles" :index="index" :key="index"
                        :item="file.name"></SortableItem>
        </SortableList>
      </div>
    </v-layout>
  </v-container>
</template>

<script>
  import axios from 'axios'
  import {ContainerMixin, ElementMixin} from 'vue-slicksort';

  const SortableList = {
    mixins: [ContainerMixin],
    template: `<v-list class="file-list"><slot /></v-list>`,
  };

  const SortableItem = {
    mixins: [ElementMixin],
    props: ['item'],
    template: `<v-list-tile
class="file-item"><v-list-tile-content><v-list-tile-title v-text="item"></v-list-tile-title></v-list-tile-content></v-list-tile>`,
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
                this.allImgFiles = this.allImgFiles.concat(imgFiles);
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
        if(images){
          for (let i = 0; i < images.length; i++) {
            this.data.requests[i].image.content = images[i].base64;
          }
        } else {
            this.data.requests = null;
        }

        this.convertToText();
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
        console.log("read");
        this.buildRequests(this.allImgFiles);
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
      clearList() {
          this.allImgFiles = [];
          this.data.requests = [];
      }
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

  input:focus,
  select:focus,
  textarea:focus,
  button:focus {
    outline: none;
  }

  .drop {
    width: 55%;
    height: 90%;
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
    height: 230px;
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
    font-size: 500%;
    position: relative;
    color: #13546C;
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
    background: #13546C;
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


  // File List Styles
  div.list-wrapper {
    margin-top: 30px;
  }
  button.clear-btn {
    color: white;
    margin: 0;
  }
  div.v-list.file-list {
    padding: 0;
  }
  div.file-item {
    border: 1px solid #DADFE3;
  }


  // Action Button Styles
  button.read-btn {
    z-index: 10;
    background: #fa183d;
  }
  button.read-btn:before {
    background: #fa183d;
    animation: pulse-border 1500ms ease-out infinite;
  }
  button.read-btn:after {
    background: #ba1f24;
    transition: all 200ms;
  }
  @keyframes pulse-border {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(1.3);
      opacity: 0;
    }
  }

</style>
