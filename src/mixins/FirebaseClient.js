import Config from '@/config.js'

export default {
  
  data: function(){
    return {
    }
  },
  
  created() {
    this.initFirebase()
  },

  methods: {
    initFirebase() {
      let self = this

      firebase.initializeApp(Config.CONFIG_FIREBASE)
      firebase.auth().onAuthStateChanged(function(auth) {
        if (auth) {
          console.log("logged in "+auth.uid);
          auth.username = auth.uid.replace("steemconnect:","");
          auth.logged = true
          self.checkIfAdmin(auth.username);
        } else {
          auth = {
            logged: false,
            isAdmin: true,
          }
          console.log("logged out");
        }
        self.$store.state.auth = auth
      });
    },

    checkIfAdmin(username){
      let self = this
      firebase.database().ref(config.bot+'/admins').on('value', function(data){
        var admins = data.val();
        if(admins['steemconnect:'+username]){
          self.$store.state.auth.isAdmin = true
          console.log('@'+username+' is an admin');
        }
      }, function(error){
        console.log("error admins: "+error.message);
      });
    }
  }
}



/*function imgUser(account){
  //return '<div class="cropnav"><img src="https://steemitimages.com/u/'+account+'/avatar/small"/></div></div>';
  return '<div class="cropnav" style="background-image: url(https://steemitimages.com/u/'+account+'/avatar/small);"></div>';
}

function imgUserDevice(account){
  //return '<div class="cropnav-device"><img src="https://steemitimages.com/u/'+account+'/avatar/small"/></div></div>';
  return '<div class="cropnav-device" style="background-image: url(https://steemitimages.com/u/'+account+'/avatar/small);"></div>';
}*/

