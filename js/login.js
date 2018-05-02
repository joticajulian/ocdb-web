
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in
    console.log("logged in "+user.uid);
    name = user.uid.replace("steemconnect:","");    
    $("#nav-user").html(imgUser(name));
    $("#nav-user").show();
    $("#nav-login").hide();
    $("#nav-logout").show();    
  } else {
    console.log("logged out");
    $("#nav-user").hide();
    $("#nav-login").show();
    $("#nav-logout").hide();    
  }
});

function login(){
  console.log("redirect to login");
  window.open("https://us-central1-steem-bid-bot.cloudfunctions.net/redirect", "_self");
}

function logout(){
  console.log("Trying to logout");
  firebase.auth().signOut().then(function() {
    
  }).catch(function(error) {
    console.log("Error trying to logout: "+error.message);
  });
}

function imgUser(account){
  return ''+
    '<div class="media">'+
      '<img class="d-flex mr-3 rounded-circle" src="https://steemitimages.com/u/'+account+'/avatar/small" alt="">'+
    '</div>';
}
