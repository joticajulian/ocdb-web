<template>
  <div>
    <HeaderOCDB/>
    <div class="container">
      <div v-if="!loading.steem">
        <div v-if="account" class="row mt-4 fancy-container">
          <div class="profile" :style="this.account.cover_image==''?'background-color: #00000000;':'background-image: url('+this.account.cover_image+');'">
            <div>
              <div class="image" :style="'background-image: url('+this.account.profile_image+');'"></div>
              <div class="name"><h1><strong>@{{this.account.name}}</strong></h1></div>
            </div>
          </div>
          <div v-if="!loading.firebase" style="width:100%;">
            <div v-if="ocdb_account">
              <h2 class="text-center mt-5 mb-3">😃😃 You are in the whitelist 😃😃</h2>
              <div class="row">
                <h4 class="col-md-6">Last bid: {{ocdb_account.time_last_bid}}</h4>
                <div class="col-md-6">
                  <button v-if="$store.state.auth.isAdmin" class="float-right button" @click="removeUser">Remove User</button>
                </div>
              </div>
            </div>
            <div v-else>
              <h2 class="text-center mt-5 mb-3">Sorry, you are not in the whitelist 😕</h2>
              <div class="row">
                <h4 class="col-md-6"></h4>
                <div class="col-md-6">
                  <button v-if="$store.state.auth.isAdmin" class="float-right button" @click="addUser">Add User</button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="loader"></div>
        </div>
      </div>
      <div v-else class="loader"></div>
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
      account: null,
      ocdb_account: null,
      loading: {
        firebase: true,
        steem: true
      }
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

    this.loadUserFirebase(user)
    this.loadUserSteem(user)
  },

  methods: {
    loadUserFirebase(username){
      username = username.replace(/[.]/g,',')
      let self = this
      firebase.initializeApp(Config.CONFIG_FIREBASE)
      firebase.database().ref(Config.BOT+'/whitelist/'+username).on('value', function(snapshot) {
        self.ocdb_account = snapshot.val()
        if(self.ocdb_account) self.ocdb_account.time_last_bid = new Date(self.ocdb_account.last_bid).toISOString().slice(0,-5)
        console.log('firebase loaded')
        console.log(self.ocdb_account)
        self.loading.firebase = false
      }, function(error){
        this.showDanger("Error loading from firebase: "+error.message)
        console.log(error)
        self.loading.firebase = false
      })
    },

    async loadUserSteem(username){
      let self = this
      try{
        var result = await this.steem_database_call('get_accounts',[[username]])
        if(!result || result.length == 0) throw new Error('@'+username+' does not exist')
        result[0].json_metadata = JSON.parse(result[0].json_metadata)
        result[0].profile_image = Utils.extractUrlProfileImage(result[0].json_metadata);
        result[0].cover_image = Utils.extractUrlCoverImage(result[0].json_metadata);
        this.account = result[0]
        this.loading.steem = false
      }catch(error){
        this.showDanger('Error loading steem user: '+error.message)
        console.log(error)
        this.loading.steem = false
      }
    },

    addUser(){
      var yesterday = new Date().getTime() - 1000*60*60*24
      var user = {
        last_bid: yesterday,
      };

      var username = this.account.name.replace(/[.]/g,",")

      let self = this
      firebase.database().ref(Config.BOT+'/whitelist/'+username).set(user)
      .then(function() {
        console.log("Account @"+username+" added");
        self.showSuccess('Account added to the whitelist')
      })
      .catch(function(error) {
        console.log('Error: '+error.message)
        self.showDanger(error.message)
      })
    },

    removeUser(){
      var username = this.account.name.replace(/[.]/g,",")

      let self = this
      firebase.database().ref(Config.BOT+'/whitelist/'+username).set(null)
      .then(function() {
        console.log("Account @"+username+" deleted!")
        self.showSuccess('Account removed from the whitelist')
      })
      .catch(function(error) {
        console.log('Error: '+error.message)
        self.showDanger(error.message)
      })
    }
  }
}
</script>

<style scoped>
.profile{  
  text-align: center;
  display: block;
  height: 8rem;
  width: 100%;
  overflow: hidden;
  background-size: cover;
  background-position: center center;
  color: white;
  text-shadow: 2px 2px 5px #000000;  
  
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.image{
  overflow: hidden;
  background-size: cover;
  background-position: center center;
  padding: 7px;
  height: 3.5rem;
  width: 3.5rem;
  border-radius: 50%;
  display: inline-block;
  vertical-align: middle;
  margin-right: 10px;
}
.name{
  display: inline-block;
  vertical-align: middle;
}
.page{
  display: inline-block;
  margin: 10px 4px;
}
</style>
