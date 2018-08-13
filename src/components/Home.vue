<template>
  <v-container fluid>
    <v-layout row justify-center>
      <img src="../assets/dismango-logo-yellow.png" style="height: 120px">
    </v-layout>

    <v-jumbotron v-if="!playingState && !pausedState">
      <v-container fill-height>
        <v-layout align-center>
          <v-flex text-xs-center>
            <div class="drop" v-if="!processingState">
              <div class="cont">
                <v-icon>cloud_upload</v-icon>
                <div class="tit">
                  Drag & Drop
                </div>
                <div class="desc">
                  your image files, or
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
            <v-progress-circular
              :size="240"
              :width="5"
              color="white"
              indeterminate
              v-if="processingState"
            ></v-progress-circular>
          </v-flex>
        </v-layout>
      </v-container>
    </v-jumbotron>

    <v-layout row justify-center v-if="!uploadedState && !processingState && !playingState && !pausedState">
      <p class="file-warning-text">This application currently supports image files only. If you want to upload a pdf file, please convert the
        file to image(s) by clicking <a href="https://pdftoimage.com/" target="_blank">here</a>.</p>
    </v-layout>

    <v-layout row justify-center v-if="processingState">
      <p class="file-warning-text">Processing images...</p>
    </v-layout>

    <v-layout row justify-center>
      <v-btn fab dark large @click="read" class="red-btn" v-if="uploadedState">
        <v-icon dark x-large color="white">play_arrow</v-icon>
      </v-btn>
      <v-btn fab dark large @click="pause" v-if="playingState">
        <v-icon dark x-large color="white">pause</v-icon>
      </v-btn>
      <v-btn fab dark large @click="play" v-if="pausedState">
        <v-icon dark x-large color="white">play_arrow</v-icon>
      </v-btn>
      <v-btn fab dark large @click="stop" v-if="playingState || pausedState">
        <v-icon dark x-large color="white">stop</v-icon>
      </v-btn>
    </v-layout>

    <div v-if="!processingState && !playingState && !pausedState">
      <v-layout justify-center v-if="allImgFiles.length > 0" class="rearrange-text">
        <p>Re-arrange by dragging files to desired order.</p>
      </v-layout>
      <v-layout justify-center>
        <div v-if="allImgFiles.length > 0">
          <v-btn block depressed color="red darken-1" class="clear-btn" @click="clearList">Clear</v-btn>
          <SortableList lockAxis="y" v-model="allImgFiles">
            <SortableItem v-for="(file, index) in allImgFiles" :index="index" :key="index"
                          :item="file.name"></SortableItem>
          </SortableList>
        </div>
      </v-layout>
    </div>

    <v-layout row justify-center v-if="playingState || pausedState">
      <v-btn depressed class="toggle-text-btn" @click="toggleText">{{showText ? 'Hide' : 'Show'}} Text</v-btn>
    </v-layout>

    <v-layout row v-if="showText">
      <p class="filtered-text">{{ filteredText }}</p>
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
        showText: false,
        // states
        uploadedState: false,
        processingState: false,
        playingState: false,
        pausedState: false,
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
      convertToText() {
        axios.post(
          `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`,
          this.data).then(response => {
          this.result = response.data.responses;
          for (let i = 0; i < this.result.length; i++) {
            this.convertedText += this.result[i].textAnnotations[0].description + " ";
          }
          this.filteredText = this.filterText(this.convertedText);
          this.processingState = false;
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
        this.uploadedState = false;
        this.processingState = true;
        this.buildRequests(this.allImgFiles);
      },
      speak() {
        if (this.filteredText) {
          this.utterThis.text = this.filteredText;
          this.utterThis.voice = this.voiceList[this.selectedVoice];
          this.playingState = true;
          this.synth.speak(this.utterThis);
          this.clearList();
        }
      },
      pause() {
        console.log("paused");
        this.synth.pause();
        this.playingState = false;
        this.pausedState = true;
      },
      play() {
        console.log("play");
        this.synth.resume();
        this.pausedState = false;
        this.playingState = true;
      },
      stop() {
        console.log("cancel");
        this.synth.cancel();
        this.result = null;
        this.playingState = false;
        this.pausedState = false;
        this.filteredText = null;
      },
      clearList() {
          this.allImgFiles = [];
          this.data.requests = [];
      },
      toggleText() {
          this.showText = !this.showText;
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
    },
    watch: {
        allImgFiles: function() {
            this.allImgFiles.length > 0 ? this.uploadedState = true : this.uploadedState = false;
        },
        filteredText: function() {
            this.speak();
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

  input:focus,
  select:focus,
  textarea:focus,
  button:focus {
    outline: none;
  }

  .drop {
    width: 55%;
    height: 90%;
    border: 3px dashed #ffffff;
    border-radius: 15px;
    overflow: hidden;
    text-align: center;
    background: transparent;
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
    color: #ffffff;
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
    color: #ffffff;
  }

  .drop .cont .tit {
    font-size: 400%;
    text-transform: uppercase;
  }

  .drop .cont .desc {
    color: #ffffff;
  }

  .drop .cont .browse {
    margin: 10px 25%;
    color: #ff5f6d;
    padding: 8px 16px;
    border-radius: 5px;
    background: #ffffff;
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
  div.rearrange-text {
    margin-top: 20px;
    p {
      text-align: center;
      color: #ffffff;
      font-size: 16px;
    }
  }
  button.clear-btn {
    color: white;
    margin: 0;
  }
  div.v-list.file-list {
    padding: 0;
  }
  div.file-item {
    border-bottom: .5px solid #999;
    border-left: .5px solid #999;
    border-right: .5px solid #999;
    background: #ffffff;
    color: #777;
  }


  // Action Button Styles
  button.red-btn {
    z-index: 10;
    background: #fa183d;
  }
  button.red-btn:before {
    background: #fa183d;
    animation: pulse-border 1500ms ease-out infinite;
  }
  button.red-btn:after {
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


  // Misc Styles
  .file-warning-text {
    text-align: center;
    width: 55%;
    color: #ffffff;
    font-size: 18px;
    a {
      color: #ffffff;
    }
  }
  .filtered-text {
    color: white;
    margin: 20px 80px 40px 80px;
    font-size: 16px;
    line-height: 1.6;
  }
  .toggle-text-btn {
    color: #ff5f6d;
    border-radius: 5px;
    background: #ffffff;
    margin-top: 20px;
  }

</style>
