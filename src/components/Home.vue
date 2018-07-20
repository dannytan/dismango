<template>
  <v-container fluid>
    <h1>ReadMe</h1>
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
        },
        exampleText:
          "DIALOGUE 149 Our Sea of Islands Epeli Hau'ofa I his essay raises some issues of great importance to our region, and offers a view of Oceania that is new and optimistic. What I say here is likely to disturb a number of men and women who have dedicated their lives to Oceania and for whom I hold the greatest respect and affection, and always will. In our region, two levels of operation are pertinent to the purposes of this paper. The first is that of national governments and regional and international diplomacy, in which the present and future of Pacific island states and territories are planned and decided on. Discussions here are the preserve of politicians, bureaucrats, statutory body officials, diplomats and the military, and representatives of the financial and business com- munities, often in conjunction with donor and international lending organizations, and advised by academic and consultancy experts. Much that passes at this level concerns aid, concessions, trade, investment, defense and security, matters that have taken the Pacific further and fur- ther into dependency on powerful nations. The other level is that of ordinary people, peasants and proletarians, who, because of the poor flow of benefits from the top, skepticism about stated policies and the like, tend to plan and make decisions about their lives independently, sometimes with surprising and dramatic results that go unnoticed or ignored at the top. Moreover, academic and consultancy experts tend to overlook or misinterpret grassroots activities because they do not fit with prevailing views about the nature of society and its devel- opment. Views of the Pacific from the level of macroeconomics and macropoli- tics often differ markedly from those from the level of ordinary people. The vision of Oceania presented in this essay is based on my observations of behavior at the grass roots. Having clarified my vantage point, I make a statement of the obvious- that views held by those in dominant positions about their subordinates could have significant consequences for people's self-image and for the ways they cope with their situations. Such views, which are often deroga- tory and belittling, are integral to most relationships of dominance and subordination, wherein superiors behave in ways or say things that are accepted by their inferiors, who in turn behave in ways that serve to per- petuate the relationships. In Oceania, derogatory and belittling views of indigenous cultures are traceable to the early years of interactions with Europeans. The wholesale condemnation by Christian missionaries of Oceanic cultures as savage, lascivious, and barbaric has had a lasting and negative effect on people's views of their histories and traditions. In a number of Pacific societies peo- ple still divide their history into two parts: the era of darkness associated with savagery and barbarism; and the era of light and civilization ushered in by Christianity."
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
