<template>
  <div>
    <div id="main-header">
      <router-link id="a-title-bot" to="/">
       <img id="img-bot" src="@/assets/ocd_logo.png"/>
       <div id="title-bot">Operation Curation Bot</div>
      </router-link>
      
      <ul class="login-block-desktop" v-if="$store.state.auth.logged">
        <li class="nav-login" id="nav-user">        
        </li>
        <li class="nav-login" id="nav-logout">
          <button class="button" @click="logout">Log out</button>
        </li>
      </ul>
      <ul class="login-block-desktop" v-else>
        <li class="nav-login" id="nav-login">
          <button class="button" @click="login">Log in</button>
        </li>
      </ul>
    </div>
    <nav id="main-nav">  
      <ul id="menu-items">
        <li class="nav-item" title="Whitelist">
          <router-link class="nav-link" to="/whitelist">
            <font-awesome-icon icon="users" />
            <span class="ml-2 nav-link-text">Whitelist</span>
          </router-link>
        </li>
        <li class="nav-item" title="Queue">
          <router-link class="nav-link" to="/queue">
            <font-awesome-icon icon="book" />
            <span class="ml-2 nav-link-text">Queue</span>
          </router-link>
        </li>
        <li class="nav-item" title="Delegators">
          <router-link class="nav-link" to="/delegators">
            <font-awesome-icon icon="user-tie" />
            <span class="ml-2 nav-link-text">Delegators</span>
          </router-link>
        </li>
        <li class="nav-item" id="history-tab" title="History" v-if="$store.state.auth.isAdmin">
          <router-link class="nav-link" to="/history">
            <font-awesome-icon icon="history" />
            <span class="ml-2 nav-link-text-underline">History</span>
          </router-link>
        </li>
        <li class="nav-item" id="admins-tab" title="Admins" v-if="$store.state.auth.isAdmin">
          <router-link class="nav-link" to="/admins">
            <font-awesome-icon icon="tools" />
            <span class="ml-2 nav-link-text">Admins</span>
          </router-link>
        </li>
        <li class="nav-item" id="history-tab" title="History2" v-if="$store.state.auth.isAdmin">
          <router-link class="nav-link" to="/history2">
            <font-awesome-icon icon="history" />
            <span class="ml-2 nav-link-text-underline">History2</span>
          </router-link>
        </li>
      </ul>    
    </nav>
  </div>
</template>

<script>
import Config from '@/config.js'
import FirebaseClient from '@/mixins/FirebaseClient.js'

export default {
  name: 'HeaderOCDB',

  mixins: [
    FirebaseClient
  ],

  methods: {
    login() {
      if(Config.DEV_LOGIN){
        this.$store.state.auth = {
          logged: true,
          isAdmin: true,
        }
        return
      }
      console.log("redirect to login")
      window.open("https://us-central1-steem-bid-bot.cloudfunctions.net/redirect", "_self");
    },

    logout() {
      if(Config.DEV_LOGIN){
        this.$store.state.auth = {
          logged: false,
          isAdmin: false,
        }
        return
      }
      
      console.log("Trying to logout")
      firebase.auth().signOut()
    }
  }
}
</script>
