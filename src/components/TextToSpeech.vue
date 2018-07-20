<template>
  <v-container fluid>

    <!--<transition name="fade">
      <div class="form-container">
        <form @submit.prevent="read">
          <h1>Speech Example</h1>
          <div class="form-group" v-if="voiceList.length">
            <label for="voices">Select a voice</label>
            <select class="form-control" id="voices" v-model="selectedVoice">
              <option v-for="(voice, index) in voiceList" :data-lang="voice.lang" :value="index">
                {{ voice.name }} ({{ voice.lang }})
              </option>
            </select>
          </div>
        </form>
      </div>
    </transition>-->

    <v-btn @click="read">Read</v-btn>
    <v-btn @click="pause">Pause</v-btn>
    <v-btn @click="play">Play</v-btn>
    <v-btn @click="cancel">Cancel</v-btn>


  </v-container>
</template>

<script>

  export default {

    data() {
      return {
        exampleText: "The vision of Oceania presented in this essay is based on my observations of behavior at the grass roots. Having clarified my vantage point, I make a statement of the obvious- that views held by those in dominant positions about their subordinates could have significant consequences for people's self-image and for the ways they cope with their situations. Such views, which are often deroga- tory and belittling, are integral to most relationships of dominance and subordination, wherein superiors behave in ways or say things that are accepted by their inferiors, who in turn behave in ways that serve to per- petuate the relationships. In Oceania, derogatory and belittling views of indigenous cultures are traceable to the early years of interactions with Europeans. The wholesale condemnation by Christian missionaries of Oceanic cultures as savage, lascivious, and barbaric has had a lasting and negative effect on people's views of their histories and traditions. In a number of Pacific societies peo- ple still divide their history into two parts: the era of darkness associated with savagery and barbarism; and the era of light and civilization ushered in by Christianity.",
        isLoading: true,
        msg: '',
        selectedVoice: 0,
        synth: window.speechSynthesis,
        voiceList: [],
        greetingSpeech: new window.SpeechSynthesisUtterance()
      }
    },
    methods: {
      /**
       * React to speech events
       */
      listenForSpeechEvents () {
        this.greetingSpeech.onstart = () => {
          this.isLoading = true
        };

        this.greetingSpeech.onend = () => {
          this.isLoading = false
        }
      },

      filterText(str) {
        return str.replace(/- /g, '');
      },

      /**
       * Shout at the user
       */
      read () {
          console.log("Rate: " + this.greetingSpeech.rate + ", Pitch: " + this.greetingSpeech.pitch);

        this.exampleText = this.filterText(this.exampleText);
        this.greetingSpeech.text = `${this.exampleText}`;
        this.greetingSpeech.voice = this.voiceList[this.selectedVoice]
        this.synth.speak(this.greetingSpeech)
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
      }
    },
    mounted () {
      speechSynthesis.speak(new SpeechSynthesisUtterance("Hey what's up there."));

      this.voiceList = this.synth.getVoices();

      if (this.voiceList.length) {
        this.isLoading = false
      }

      this.synth.onvoiceschanged = () => {
        this.voiceList = this.synth.getVoices();
        // give a bit of delay to show loading screen
        // just for the sake of it, I suppose. Not the best reason
        setTimeout(() => {
          this.isLoading = false
        }, 800)
      };

      this.listenForSpeechEvents()
    },
  }

</script>

<style scoped type="text/css" lang="css"></style>
