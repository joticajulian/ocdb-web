
var whitelist = {};
var current_key = null;
var size_whitelist = 0;

getQueryAndLogin();

if(!isDesktop()){
  $('whitelist').css('overflow-y','hidden');
}

firebase.database().ref(config.bot+'/whitelist').on('value', function(snapshot) {
  whitelist = snapshot.val();
  $('#whitelist').html('');
  size_whitelist = 0;
  for(var key in whitelist) {
   size_whitelist++;
   acc = key.replace(/[,]/g,".");
   $('#whitelist').append(itemList(acc));   
  }
  $('.size-whitelist').text(size_whitelist);
}, function(error){
  console.log("error loading the whitelist: "+error.message);
  $('#error-message').text('error loading the whitelist: '+error.message).show();
});

function deleteAccount(){
  if(isDesktop()){
    var key = $('#remove-account').val().toLowerCase();
  }else{
    var key = $('#remove-account-device').val().toLowerCase(); 
  }  
  firebase.database().ref(config.bot+'/whitelist/'+key).set(null)
  .then(function() {
    console.log("Account @"+key+" deleted!");
    $('#success-message').text('@'+key+' removed from whitelist').show();
    $('#error-message').hide();  
  })
  .catch(function(error) {
    console.log('Error: '+error.message);
    $('#success-message').hide();
    $('#error-message').text('Error: '+error.message).show();
  });
}

function addAccount(){
  if(isDesktop()){
    var key = $('#new-account').val().toLowerCase();
  }else{
    var key = $('#new-account-device').val().toLowerCase();
  }
  var account = true;
  key = key.replace(/[.]/g,",");
  firebase.database().ref(config.bot+'/whitelist/'+key).set(account)
  .then(function() {
    console.log("Account @"+key+" added");
    $('#success-message').text('@'+key+' added to whitelist').show();
    $('#error-message').hide();  
  })
  .catch(function(error) {
    console.log('Error: '+error.message);
    $('#success-message').hide();
    $('#error-message').text('Error: '+error.message).show();
  });
}

function itemList(key){
  return ''+
    '<div class="visibledesktop-inline">'+
      '<div class="whitelist-item">'+
        //'<center><div class="crop">'+// style="background-image: url("https://steemitimages.com/u/'+key+'/avatar/small")>'+
        '<center><div class="crop" style="background-image: url(https://steemitimages.com/u/'+key+'/avatar/small);">'+
        //  '<img src="https://steemitimages.com/u/'+key+'/avatar/small" class="whitelist-img"/>'+
        '</div>'+  
        '<span class="item-name">'+key+'</span></center>'+
      '</div>'+
    '</div>'+
    '<div class="visibledevice">'+    
      '<div class="whitelist-item-device visibledevice">'+
        '<span class="item-name-device">'+key+'</span></center>'+
      '</div>'+
    '</div>';  
}

function getQueryAndLogin(){
  if(typeof document.location.search == 'undefined' || document.location.search == '') return false;
  var kvp = document.location.search.substr(1).split('&');
  
  if(kvp != ''){
    var i = kvp.length; 	
    while (i--) {
      var x = kvp[i].split('=');
      if (x[0] == 'code'){
        steemconnect_token = x[1];
        
        $.get("https://us-central1-steem-bid-bot.cloudfunctions.net/callback?code="+steemconnect_token, function (data) {
          if(!data.token){
            $('#error-message').text('An error occurred when logging in').show();
            return;
          }
          console.log("response callback token:" + data.token);
          firebase_token = data.token;
          firebase.auth().signInWithCustomToken(firebase_token).catch(function(error) {
            console.log(error.code + ": " + error.message);
            $('#error-message').text(error.code + ": " + error.message).show();
          });
        });        
      }
    }
  }
}  