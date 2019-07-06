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
    </div>
  </div>
</template>

<script>
import Config from '@/config.js'
import HeaderOCDB from '@/components/HeaderOCDB'
import SteemClient from '@/mixins/SteemClient.js'

export default {
  name: 'Home',

  data (){
    return {
    }
  },

  components: {
    HeaderOCDB
  },

  mixins: [
    SteemClient
  ],

  created() {
  },
  
  methods: {
  }
}
</script>
