
var whitelist = {};
var current_key = null;

getQueryAndLogin();

firebase.database().ref(config.bot+'/whitelist').on('value', function(snapshot) {
  whitelist = snapshot.val();
  $('#whitelist').html('');
  first = true;
  for(var key in whitelist) {
   acc = key.replace(/[,]/g,".");
   $('#whitelist').append(itemList(acc));
   $('#account-'+acc).on('click', function(){  setAccount($(this).attr("id"));  });
   if(first){
     setAccount(acc);
     first = false;
   }
  }  
}, function(error){
  console.log("error loading the whitelist: "+error.message);
  $('error-message').text('error loading the whitelist: '+error.message).show();
});

function setAccount(key){
  sp = key.split('account-');
  if(sp[0] == '') key = sp[1];
  else key = sp[0];  
  current_key = key;
  if(typeof whitelist[key] === 'undefined'){
    $('#card-header-account').html('');
    $('#card-body-account').html('');
    console.log("setAccount: undefined user - "+key);
    return;
  }
  console.log("Setting account @"+key);
  $('#card-header-account').text('@'+key);
  $('#card-body-account').html('<button id="but-delete" type="button" class="btn btn-primary btn-block" onclick="deleteAccount()">Delete</button>');
}

function deleteAccount(){
  var key = current_key;
  console.log("Account @"+key+" deleted!");
  firebase.database().ref(config.bot+'/whitelist/'+key).set(null);
}

function addAccount(){
  var key = $('#new-account').val().toLowerCase();
  console.log("Adding account @"+account);
  var account = true;
  key = key.replace(/[.]/g,",");
  firebase.database().ref(config.bot+'/whitelist/'+key).set(account);
}

function itemList(key){
  return ''+
    '<a class="list-group-item list-group-item-action" id="account-'+key+'")">'+
      '<div class="media">'+
        //'<img class="d-flex mr-3 rounded-circle" src="https://steemitimages.com/u/'+key+'/avatar/small" alt="">'+
        '<div class="media-body">'+
          '<strong>'+key+'</strong>'+
        '</div>'+
      '</div>'+
    '</a>';
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
            $('error-message').text('An error occurred when logging in').show();
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