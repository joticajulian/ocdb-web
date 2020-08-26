<template>
  <div>
  
    <HeaderOCDB/>
  
    <div class="content-wrapper">
      <div v-if="alert.info" class="alert alert-info" role="alert">{{alert.infoText}}</div>
      <div v-if="alert.success" class="alert alert-success" role="alert" v-html="alert.successText"></div>
      <div v-if="alert.danger"  class="alert alert-danger" role="alert">{{alert.dangerText}}</div>
    </div>
  
    <div class="fancy-container">
      <div class="content-subtitle-black h1 ib" style="padding:6px;">Transaction Queue</div>
      <div class="row fancy bold">
        <div class="col-md-2">KEY</div>
        <div class="col-md-2">OPERATION</div>
        <div class="col-md-2">EXPIRED</div>
        <div class="col-md-2">STATUS</div>
      </div>
      <div class="row fancy" v-for="(tx, key) in transaction_queue">
        <div class="col-md-2"><small class="monospace">{{key}}({{tx.key}})</small></div>
        <div class="col-md-2">{{tx.operation[0]}} to {{tx.user}}</div>
        <div class="col-md-2">{{tx.expired}}</div>
        <div class="col-md-2" v-if="tx.found"><a :href="'https://joticajulian.github.io/steemexplorer/#/b/'+tx.block+'/'+tx.transaction">Link</a></div>
        <div class="col-md-2" v-else-if="tx.expired"><button class="btn btn-primary" @click="relaunch(tx.key)">Relaunch</button></div>
        <div class="col-md-2" v-else>In progress</div>
        <div class="col-md-2">{{tx.expiration}}</div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Config from '@/config.js'
import HeaderOCDB from '@/components/HeaderOCDB'
import SteemClient from '@/mixins/SteemClient.js'

export default {
  name: 'history2',

  data (){
    return {
      admin_operations: [],
      transaction_queue: {},
      operations: {}
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

    firebase.initializeApp(Config.CONFIG_FIREBASE)

    firebase.database().ref(Config.BOT+'/admin_operations').on('value', function(data){
      if(data.val()){
        self.admin_operations = data.val()
        self.handleAdminOperations()
      }
    })

    firebase.database().ref(Config.BOT+'/transaction_queue').on('value', function(data){
      var transaction_queue = data.val()
      var tq = []
      console.log('transaction_queue loaded')
      for(var key in transaction_queue) {
        var trx = transaction_queue[key]
        trx.key = key
        trx.expired = new Date(trx.time_last_block_checked + 'Z') > new Date(trx.expiration + 'Z')
        if(isNaN((new Date(trx.time_last_block_checked + 'Z')).getTime() )) trx.expired = 'error'
        switch(trx.operation[0]){
          case 'vote':
            trx.user = trx.operation[1].author
            break
          case 'comment':
            trx.user = trx.operation[1].parent_author
            break
          case 'transfer':
            trx.user = trx.operation[1].to
            break
          default:
            trx.user = ''
            break
        }
        tq.push(trx)
      }
      
      tq.sort( (a,b)=>{ return new Date(a.expiration) < new Date(b.expiration) ? 1:-1} )
      self.transaction_queue = tq
    })
  },

  methods: {
    handleAdminOperations() {
      for(var i in this.admin_operations){
        
      }
      console.log('handleAdminOperations')
      console.log(this.admin_operations)
    },

    relaunch(key) {
      var op = {
        admin: 'jga',
        operation: 'relaunch_transaction',
        key: key
      }
      var id = this.admin_operations.length
      this.admin_operations.push(op)
      firebase.database().ref(Config.BOT+'/admin_operations/'+id).set(op)
      console.log('launch operation')
      console.log(op)
    }
  },
}
</script>
