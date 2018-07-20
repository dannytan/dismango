<template>
  <v-container fluid>

    <transition name="fade">
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


          <button type="submit" class="btn btn-success">Read</button>
        </form>

      </div>
    </transition>

    <v-btn @click="pause">Pause</v-btn>
    <v-btn @click="play">Play</v-btn>


  </v-container>
</template>

<script>

  export default {

    data() {
      return {
        exampleText: "DIALOGUE 149 Our Sea of Islands Epeli Hau'ofa I his essay raises some issues of great importance to our region, and offers a view of Oceania that is new and optimistic. What I say here is likely to disturb a number of men and women who have dedicated their lives to Oceania and for whom I hold the greatest respect and affection, and always will. In our region, two levels of operation are pertinent to the purposes of this paper. The first is that of national governments and regional and international diplomacy, in which the present and future of Pacific island states and territories are planned and decided on. Discussions here are the preserve of politicians, bureaucrats, statutory body officials, diplomats and the military, and representatives of the financial and business com- munities, often in conjunction with donor and international lending organizations, and advised by academic and consultancy experts. Much that passes at this level concerns aid, concessions, trade, investment, defense and security, matters that have taken the Pacific further and fur- ther into dependency on powerful nations. The other level is that of ordinary people, peasants and proletarians, who, because of the poor flow of benefits from the top, skepticism about stated policies and the like, tend to plan and make decisions about their lives independently, sometimes with surprising and dramatic results that go unnoticed or ignored at the top. Moreover, academic and consultancy experts tend to overlook or misinterpret grassroots activities because they do not fit with prevailing views about the nature of society and its devel- opment. Views of the Pacific from the level of macroeconomics and macropoli- tics often differ markedly from those from the level of ordinary people. The vision of Oceania presented in this essay is based on my observations of behavior at the grass roots. Having clarified my vantage point, I make a statement of the obvious- that views held by those in dominant positions about their subordinates could have significant consequences for people's self-image and for the ways they cope with their situations. Such views, which are often deroga- tory and belittling, are integral to most relationships of dominance and subordination, wherein superiors behave in ways or say things that are accepted by their inferiors, who in turn behave in ways that serve to per- petuate the relationships. In Oceania, derogatory and belittling views of indigenous cultures are traceable to the early years of interactions with Europeans. The wholesale condemnation by Christian missionaries of Oceanic cultures as savage, lascivious, and barbaric has had a lasting and negative effect on people's views of their histories and traditions. In a number of Pacific societies peo- ple still divide their history into two parts: the era of darkness associated with savagery and barbarism; and the era of light and civilization ushered in by Christianity.",
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

      /**
       * Shout at the user
       */
      read () {
          console.log("Rate: " + this.greetingSpeech.rate + ", Pitch: " + this.greetingSpeech.pitch);
        this.greetingSpeech.text = `${this.exampleText}`;

        this.greetingSpeech.voice = this.voiceList[this.selectedVoice]

        this.synth.speak(this.greetingSpeech)
      },

      pause() {
          this.synth.pause();
      },
      play() {
        this.synth.resume();
      }
    },
    mounted () {
      //speechSynthesis.speak(new SpeechSynthesisUtterance("Hey what's up there."));

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
