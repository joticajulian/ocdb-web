<template>
  <div>
    <HeaderOCDB/>
    <div class="fancy-container">
      <div class="row mt-4">
        <h2>Delegators</h2>
      </div>
      <div class="title row mt-2">
        <span>Total income for all delegators today!</span> <span class="fancy ml-2">{{incomeToday}}</span>
      </div>
      <div class="row">
        <div class="col-md-2 field-title"></div>
        <div class="col-md-2 field-title">NAME</div>
        <div class="col-md-2 field-title">DELEGATION</div>
        <div class="col-md-2 field-title">PENDING PAYOUT - HIVE</div>
        <div class="col-md-2 field-title">PENDING PAYOUT - HBD</div>
        <div class="col-md-2 field-title">PENDING PAYOUT - HP</div>
      </div>
      <div v-for="(delegator, index) in delegators" :key="index">
        <div class="col-md-2 field"><div class="crop2" :style="'background-image: url(https://steemitimages.com/u/'+delegator.name+'/avatar/small);'"></div></div>
        <div class="col-md-2 field bold">{{delegator.name}}</div>
        <div class="col-md-2 field">Del: {{delegator.delegation}}</div>
        <div class="col-md-2 field">{{delegator.pendingPayoutSTEEM}}</div>
        <div class="col-md-2 field">{{delegator.pendingPayoutSBD}}</div>
        <div class="col-md-2 field">{{delegator.pendingPayoutSP}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from '@/config.js'
import Utils from '@/utils.js'
import HeaderOCDB from '@/components/HeaderOCDB'
import SteemClient from '@/mixins/SteemClient.js'

export default {
  name: 'Delegators',
  data() {
    return {
      incomeToday: "Loading...",
      steem_per_mvests: null,
      delegators: [],
      state: {},
      user_is_delegator: false,
    };
  },
  components: {
    HeaderOCDB,
  },
  created() {
    this.loadDelegators();
  },
  methods: {
    vestsToSP(vests) { return vests / 1000000 * this.steem_per_mvests; },

    isActiveDelegator(delegator) {
      var vesting_shares = parseFloat(delegator.vesting_shares);
      if(typeof delegator.new_vesting_shares === 'undefined' && vesting_shares == 0) return false;
      return true;  
    },

    isDelegatorToShow(delegator) {
      var vesting_shares = parseFloat(delegator.vesting_shares);
      if(this.vestsToSP(vesting_shares) >= 250) return true;
      return false;
    },

    loadDelegators() {
      let self = this;
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

      firebase.database().ref(Config.BOT+'/globalPropertiesSteem').on('value', function(snapshot){
        self.steem_per_mvests = snapshot.val().steem_per_mvests;
        console.log("steem_per_mvests: "+self.steem_per_mvests);
      }, function(error){
        console.log("error loading globalPropertiesSteem: "+error.message);
      });

      firebase.database().ref(Config.BOT+'/state').on('value', function(snapshot){
        self.state = snapshot.val();
        self.incomeDaySTEEM = parseFloat(self.state.steem_balance);
        self.incomeDaySBD = parseFloat(self.state.sbd_balance);
        self.liquidSteemPower = parseFloat(self.state.steem_power_balance);
        
        self.incomeToday = `${self.incomeDaySTEEM.toFixed(3)} ${Config.STEEM} + ${self.incomeDaySBD.toFixed(3)} ${Config.SBD} + ${self.liquidSteemPower.toFixed(3)} ${Config.SP}`;
        console.log("Income day Steem: "+self.incomeDaySTEEM);
        console.log("Income day SBD: "+self.incomeDaySBD);
        console.log("Income day SP: "+self.liquidSteemPower);
      }, function(error){
        console.log("error loading state: "+error.message);
      });

      firebase.database().ref(Config.BOT+'/delegators').on('value', function(snapshot) {
        const delegators = snapshot.val();
        let totalVests = 0;
        var length = 0;
        for(var d in delegators){
          totalVests += parseFloat(delegators[d].vesting_shares);
          length++;
          /* if(d == username){
            self.user_is_delegator = true;
            var percSBD = delegators[d].sbd_reward_percentage;
            var percCuration = delegators[d].curation_reward_percentage;
          } */
        }
  
        console.log('Delegators: '+length);
        console.log('Total Vests: '+totalVests);
  
        var i=1;
        self.delegators = [];
        for(var name in delegators) {
          const delegator = delegators[name];
          if(!self.isActiveDelegator(delegator)) continue;
          if(!self.isDelegatorToShow(delegator)) continue;
          var vesting_shares = parseFloat(delegator.vesting_shares);

          let delegation = `${self.vestsToSP(vesting_shares).toFixed(3)} ${Config.SP}`;
          if(delegator.new_vesting_shares) 
            delegation = `${delegation} (new change: ${self.vestsToSP(parseFloat(delegator.new_vesting_shares)).toFixed(3)} ${Config.SP})`;

          var perc_sbd = parseFloat(delegator.sbd_reward_percentage) / 100;
          var perc_steem = perc_sbd;
          var perc_sp = parseFloat(delegator.curation_reward_percentage) / 100;
  
          perc_sbd = perc_sbd < 0 ? 0 : (perc_sbd>1 ? 1 : perc_sbd);
          perc_steem = perc_steem < 0 ? 0 : (perc_steem>1 ? 1 : perc_steem);            
          perc_sp = perc_sp < 0 ? 0 : (perc_sp>1 ? 1 : perc_sp);
  
          let pendingPayoutSTEEM = self.incomeDaySTEEM * perc_steem * vesting_shares / totalVests - 0.001;
          let pendingPayoutSBD = self.incomeDaySBD * perc_sbd * vesting_shares / totalVests - 0.001;
          let pendingPayoutSP = self.liquidSteemPower * perc_sp * vesting_shares / totalVests - 0.001;
  
          if(isNaN(pendingPayoutSTEEM) || pendingPayoutSTEEM <0) pendingPayoutSTEEM = 0;
          if(isNaN(pendingPayoutSP   ) || pendingPayoutSP    <0) pendingPayoutSP    = 0;
          if(isNaN(pendingPayoutSBD  ) || pendingPayoutSBD   <0) pendingPayoutSBD   = 0;
  
          self.delegators.push({
            name,
            delegation,
            pendingPayoutSTEEM: `${pendingPayoutSTEEM.toFixed(3)} ${Config.STEEM}`,
            pendingPayoutSBD: `${pendingPayoutSBD.toFixed(3)} ${Config.SBD}`,
            pendingPayoutSP: `${pendingPayoutSP.toFixed(3)} ${Config.SP}`,
          });
          i++;
        } 
      }, function(error) {
        console.log("error loading delegators: "+error.message);  
      });
    }
  }
}
</script>

<style>
.title {
  font-size: 25px;
  align-items: center;
}
</style>