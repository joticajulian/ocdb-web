<template>
  <div class="delegation-block">
    <div style="margin:auto;">
      <div class="label-delegation">If you'd like to delegate to <span class="bot-name uc">Operation Curation Bot</span></div>
      <div class="form-delegation">
        <input type="text" class="fancy w7" id="delegator-account" v-model="delegator" placeholder="Enter username">
        <input type="text" class="fancy w7" id="delegator-amount" v-model="delegation" placeholder="Delegation amount">
        <div class="div-button-username">
          <button type="button" class="button w7" @click="delegate">Delegate</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from '@/config.js'

export default {
  name: "Delegate",

  data() {
    return {
      delegator: "",
      delegation: "",
    }
  },

  methods: {
    delegate() {
      const delegation = parseFloat(this.delegation).toFixed(3);
      window.open(`https://steemconnect.com/sign/delegateVestingShares?delegator=${this.delegator}&delegatee=ocdb&vesting_shares=${delegation}%20SP`, '_self');
    }
  }

}
</script>