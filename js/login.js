var logged = false;

$('#login-problems').hide();

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in
    console.log("logged in:");//+JSON.stringify(user));   
    console.log("user.uid: "+user.uid);
    name = user.uid.replace("steemconnect:","");
    $("#nav-user").show();
    $("#nav-user").html(imgUser(name));
    //if(location.pathname == "/login.html") window.open("/dashboard.html", "_self");
    logged = true;
  } else {
    console.log("logged out...");
    $("#nav-user").hide();
    logged = false;
    //if(location.pathname != "/login.html") window.open("/login.html", "_self");
  }
});

function login(){
  /*var email = $('#email').val();
  var password = $('#password').val();
  console.log('email: '+email);
  
  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    console.log('error signIn: code '+error.code+" : "+error.message);
    $('#login-problems').text(error.code+" : "+error.message).show();
  });*/
  
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
