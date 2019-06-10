<template>
  <div>
    <HeaderOCDB/>
    <div class="container">
      <div v-if="account" class="row mt-4">
        <div class="profile" :style="this.account.cover_image==''?'background-color: black;':'background-image: url('+this.account.cover_image+');'">
          <div>
            <div class="image" :style="'background-image: url('+this.account.profile_image+');'"></div>
            <div class="name"><h1><strong>@{{this.account.name}}</strong></h1></div>
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
      account: null
    }
  },

  components: {
    HeaderOCDB
  },

  mixins: [
    SteemClient
  ],
  created() {
    var user = this.$route.params.user
    this.steem_database_call('get_accounts',[[user]]).then( (result)=>{
      try{
        result[0].json_metadata = JSON.parse(result[0].json_metadata)
      }catch(exception){ }
      result[0].profile_image = Utils.extractUrlProfileImage(result[0].json_metadata);
      result[0].cover_image = Utils.extractUrlCoverImage(result[0].json_metadata);
      this.account = result[0]
      console.log(this.account.profile_image)
    }).catch( (err)=>{
      console.log(err)
    })
  }
}
</script>
