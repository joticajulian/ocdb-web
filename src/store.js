import Vue from 'vue'
import Vuex from 'vuex'
import Config from '@/config.js'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    auth: {
      logged: false,
      isAdmin: false,
    },
    rpc_node: Config.RPC_NODES[0],
    max_fails: 1,
    max_fail_rounds: 1000000
  },
  mutations: {

  },
  actions: {

  }
})
