<template>
  <div>
    <HeaderOCDB/>
    <div class="container">
      <div class="row mt-4">
        <div class="col-md-6">
          <h2>Operation Curation Bot</h2>
          <h3>Want to join our whitelist?</h3>
          <ul>
            <li>We are a <strong>non-profit bot</strong> on a mission to help the community.</li>
            <li>For delegators - <strong>100%</strong> of the SBD received and <strong>100%</strong> of the Curation rewards generated will go straight to our delegators (proportionate to the delegated amount).</li>
            <li>For bidders - We operate on a unique algorithm that votes with a <strong>higher reward</strong>, thus ensuring higher profitability.</li>
            <li>To receive a vote, the author must be <strong>whitelisted</strong>. Check out our list below!</li>
          </ul>
        </div>
      </div>
      <div class="fancy-container">
        <div class="row">
          <h5 class="col-md-6 text-light">Check out our whitelist community</h5>
          <div class="col-md-6 text-right">
            <h5 class="text-light"><span class="size-whitelist">{{size_whitelist}}</span> Steemians and Growing!</h5>
          </div>
        </div>
        <div class="row" id="whitelist">
          <div v-for="(account,index) in whitelist" v-bind:key="index" class="whitelist-item">
            <center>
              <a :href="account.link">
                <div class="crop" :style="{backgroundImage: 'url('+account.picture_profile+')' }"></div>
              </a>
              <span class="item-name">
                <a :href="account.link">{{account.name}}</a>
              </span>
            </center>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from '@/config.js'
import HeaderOCDB from '@/components/HeaderOCDB'
import SteemClient from '@/mixins/SteemClient.js'

export default {
  name: 'history2',

  data (){
    return {
      size_whitelist: 0,
      whitelist: []
    }
  },

  components: {
    HeaderOCDB
  },

  mixins: [
    SteemClient
  ],

  created() {
    this.loadWhitelist()
  },
  
  methods: {
    loadWhitelist() {
      let self = this
      firebase.database().ref(Config.BOT+'/whitelist').on('value', function(snapshot) {
        var whitelist = snapshot.val()
        self.size_whitelist = 0
        self.whitelist = []
        for(var key in whitelist) {
          self.size_whitelist++
          var name = key.replace(/[,]/g,".")
          var account = {
            name: name,
            link: '/@'+name, //'https://steemit.com/@'+name,
            picture_profile: '"https://steemitimages.com/u/'+name+'/avatar/small"'
          }
          self.whitelist.push(account)
        }
      }, function(error){
        console.log("error loading the whitelist: "+error.message);
      })
    }
  }
}
</script>
