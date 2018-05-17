var logged = false;
var username = '';

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in
    console.log("logged in "+user.uid);
    username = user.uid.replace("steemconnect:",""); 
    checkIfAdmin();    
    $("#nav-user").html(imgUser(username)).removeClass('hidden');
    $("#nav-login").addClass('hidden');
    $("#nav-logout").removeClass('hidden');
    
    $("#nav-user-device").html(imgUserDevice(username)).removeClass('hidden');
    $("#nav-login-device").addClass('hidden');
    $("#nav-logout-device").removeClass('hidden');
    
    $('#menu-user-name').text('@'+username);
    $('#menu-user').show();
    
    $('.form-add-remove').show();
    logged = true;
  } else {
    console.log("logged out");
    username = '';
    $("#nav-user").addClass('hidden');
    $("#nav-login").removeClass('hidden');
    $("#nav-logout").addClass('hidden');
    
    $("#nav-user-device").addClass('hidden');
    $("#nav-login-device").removeClass('hidden');
    $("#nav-logout-device").addClass('hidden');
    
    $('#menu-user').hide();
    $('#menu-admins').hide();
    
    $('.form-add-remove').hide();
    logged = false;
  }
  
  /*var height_mainheader = $('#main-header').height();
  $('#main-nav').css('margin-top', height_mainheader + 'px');*/
});

function login(){
  console.log("redirect to login");
  window.open("https://us-central1-steem-bid-bot.cloudfunctions.net/redirect", "_self");
}

function logout(){
  console.log("Trying to logout");
  firebase.auth().signOut().then(function() {
    $('#error-message').hide();
    $('#success-message').text('Logged out successfully').show();
  }).catch(function(error) {
    console.log("Error trying to logout: "+error.message);
    $('#error-message').text(error.message).show();
    $('#success-message').hide();
  });
}

function checkIfAdmin(){
  firebase.database().ref(config.bot+'/admins').on('value', function(snapshot){
    $('#menu-admins').show();
    console.log('@'+username+' is an admin');    
  });
}

function imgUser(account){
  //return '<div class="cropnav"><img src="https://steemitimages.com/u/'+account+'/avatar/small"/></div></div>';
  return '<div class="cropnav" style="background-image: url(https://steemitimages.com/u/'+account+'/avatar/small);"></div>';
}

function imgUserDevice(account){
  //return '<div class="cropnav-device"><img src="https://steemitimages.com/u/'+account+'/avatar/small"/></div></div>';
  return '<div class="cropnav-device" style="background-image: url(https://steemitimages.com/u/'+account+'/avatar/small);"></div>';
}
