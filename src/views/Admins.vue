<template>
  <div>
    <HeaderOCDB/>
    <div class="container">
      <div class="fancy-container">
        <div style="display:block;">
          <div class="total-income b mb-3">
            <span class="content-subtitle-black text-center b">Total income today</span>
            <div class="content-subtitle-black fancy c mb40 b">{{income_day}}</div>
            <span class="content-subtitle-black text-center b">Liquid steem power</span>
            <div class="content-subtitle-black fancy c b">{{liquid_steem_power}}</div>
          </div>
          <!--<div class="delegators"></div>-->
          <div class="total-income b mb-3 mt-4">
            <span class="content-subtitle-black text-center b">Liquid donations with transfers</span>      
          </div>    
          <div class="debt"></div>
          </div>
        </div>
      </div>
      <div class="fancy-container">
        <div>
          <h2 class="mt-4 mb-3">OCDB Settings</h2>
          <div class="mt-4">
            <div><strong>Min bid SBD: </strong>{{min_bid}}</div>
            <input type="text" class="fancy w7" v-model="input.min_bid" placeholder="Min bid SBD">
            <div class="div-button-username">
              <button type="button" class="button w7" @click="setMinBid">Set min bid SBD</button>
            </div>
          </div>  
          <div class="mt-4">
            <div><strong>Max bid SBD: </strong>{{max_bid}}</div>
            <input type="text" class="fancy w7" v-model="input.max_bid" placeholder="Max bid SBD">
            <div class="div-button-username">
              <button type="button" class="button w7" @click="setMaxBid">Set max bid SBD</button>
            </div>
          </div>
          <div class="mt-4">
            <div><strong>ROI factor: </strong>{{roi}}</div>
            <input type="text" class="fancy w7" v-model="input.roi" placeholder="ROI">
            <div class="div-button-username">
              <button type="button" class="button w7" @click="setROI()">Set ROI</button>
            </div>
          </div>
          <div class="mt-4">
            <div><strong>Comment: </strong><p class="fancy b"></p>{{comment}}</div>
            <textarea rows="8" cols="60" v-model="input.comment" class="comment-area" placeholder="Use {weight}% to write the vote weight, @{sender} for the sender of the bid, and @{author} for the author"></textarea>
            <div class="div-button-username" style="display:block;">
              <button type="button" class="button w7 mt5" @click="setComment">Set Comment</button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="alert.info" class="alert alert-info" role="alert">{{alert.infoText}}</div>
      <div v-if="alert.success" class="alert alert-success" role="alert" v-html="alert.successText"></div>
      <div v-if="alert.danger"  class="alert alert-danger" role="alert">{{alert.dangerText}}</div>
    </div>
  </div>
</template>

<script>
import Config from '@/config.js'
import Utils from '@/utils.js'
import HeaderOCDB from '@/components/HeaderOCDB'
import SteemClient from '@/mixins/SteemClient.js'

export default {
  name: 'WhitelistUser',

  data (){
    return {
      income_day: '',
      liquid_steem_power: '',
      min_bid: 0,
      max_bid: 0,
      ROI: 1,
      comment: '',
      input: {
        min_bid: 0,
        max_bid: 0,
        ROI: 1,
        comment: '',
      },
    }
  },

  components: {
    HeaderOCDB
  },

  mixins: [
    SteemClient
  ],

  created() {
    let self = this
    firebase.database().ref(Config.BOT+'/state').on('value', function(snapshot){
      var state = snapshot.val();
      var incomeDaySTEEM = parseFloat(state.steem_balance);
      var incomeDaySBD = parseFloat(state.sbd_balance);
      var incomeDaySP = parseFloat(state.steem_power_balance);  
      var liquid_steem_power = parseFloat(state.steem_reserve_balance);

      this.income_day = incomeDaySTEEM.toFixed(3)+' STEEM + '+incomeDaySBD.toFixed(3)+' SBD + '+incomeDaySP.toFixed(3)+' SP'
      this.liquid_steem_power = liquid_steem_power.toFixed(3)+' STEEM'

      console.log("Income day Steem: "+incomeDaySTEEM);
      console.log("Income day SBD: "+incomeDaySBD);
      console.log("Income day SP: "+incomeDaySP);
      console.log("Liquid steem power: "+liquid_steem_power);
    },function(error){
      console.log("error loading state: "+error.message);
      self.showDanger(error.message)
    })
  },

  methods: {
    setMinBid() {},
    setMaxBid() {},
    setROI() {},
    setComment() {}
  }
}
</script>

<style scoped>

</style>
