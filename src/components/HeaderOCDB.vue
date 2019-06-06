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
          <router-link class="nav-link" to="/">
            <img class="nav-img" src="@/assets/whitelist-logo.png"/>
            <span class="nav-link-text">Whitelist</span>
          </router-link>
        </li>
        <li class="nav-item" title="Queue">
          <router-link class="nav-link" to="/queue">
            <img class="nav-img" src="@/assets/queue-logo.png"/>
            <span class="nav-link-text">Queue</span>
          </router-link>
        </li>
        <li class="nav-item" title="Delegators">
          <router-link class="nav-link" to="/delegators">
            <img class="nav-img" src="@/assets/delegators-logo.png"/>
            <span class="nav-link-text">Delegators</span>
          </router-link>
        </li>
        <li class="nav-item" id="history-tab" title="History" v-if="$store.state.auth.isAdmin">
          <router-link class="nav-link" to="/history">
            <img class="nav-img" src="@/assets/history-logo.png"/>
            <span class="nav-link-text-underline">History</span>
          </router-link>
        </li>
        <li class="nav-item" id="admins-tab" title="Admins" v-if="$store.state.auth.isAdmin">
          <router-link class="nav-link" to="/admins">
            <img class="nav-img" src="@/assets/admins-logo.png"/>
            <span class="nav-link-text">Admins</span>
          </router-link>
        </li>
        <li class="nav-item" id="history-tab" title="History2" v-if="$store.state.auth.isAdmin">
          <router-link class="nav-link" to="/history2">
            <img class="nav-img" src="@/assets/history-logo.png"/>
            <span class="nav-link-text-underline">History2</span>
          </router-link>
        </li>
      </ul>    
    </nav>
  </div>
</template>

<script>

export default {
  name: 'HeaderOCDB',

  methods: {
    login() {
      alert('logins')
    },

    logout() {
      alert('logout')
    }
  }
}

</script>