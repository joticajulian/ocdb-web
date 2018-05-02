
var whitelist = {};
var current_key = null;

getQueryAndLogin();

console.log("get whitelist");
firebase.database().ref(config.bot+'/whitelist').on('value', function(snapshot) {
  whitelist = snapshot.val();
  $('#whitelist').html('');
  first = true;
  for(var key in whitelist) {
   $('#whitelist').append(itemList(key,whitelist[key]));
   $('#account-'+key).on('click', function(){  setAccount($(this).attr("id"));  });
   if(first){
     setAccount(key);
     first = false;
   }
  }  
});

function setAccount(key){
  sp = key.split('account-');
  if(sp[0] == '') key = sp[1];
  else key = sp[0];  
  current_key = key;
  if(typeof whitelist[key] === 'undefined'){
    $('#card-header-account').html('');
    $('#card-body-account').html('');
    console.log("setAccount: undefined key - "+key);
    return;
  }
  console.log("Setting account @"+whitelist[key]);
  $('#card-header-account').text('@'+whitelist[key]);
  $('#card-body-account').html('<button id="but-delete" type="button" class="btn btn-primary btn-block" onclick="deleteAccount()">Delete</button>');
}

function deleteAccount(){
  var key = current_key;
  console.log("Account @"+whitelist[key]+" deleted!");
  firebase.database().ref(config.bot+'/whitelist/'+key).set(null);
}

function addAccount(){
  var account = $('#new-account').val();
  console.log("Adding account @"+account);
  var key = firebase.database().ref('whitelist').push().key;
  firebase.database().ref(config.bot+'/whitelist/'+key).set(account);
}

function itemList(key,account){
  return ''+
    '<a class="list-group-item list-group-item-action" id="account-'+key+'")">'+
      '<div class="media">'+
        '<img class="d-flex mr-3 rounded-circle" src="https://steemitimages.com/u/'+account+'/avatar/small" alt="">'+
        '<div class="media-body">'+
          '<strong>'+account+'</strong>'+
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
          console.log("response callback token:" + data.token);
          firebase_token = data.token;
          firebase.auth().signInWithCustomToken(firebase_token).catch(function(error) {
            console.log(error.code + ": " + error.message);
          });        
        });        
      }
    }
  }
}  