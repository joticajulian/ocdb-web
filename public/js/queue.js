var rewardBalance;
var recentClaims;
var votePowerReserveRate;
var roi;
var steemPrice; //coinmarketcap
var sbdPrice; //coinmarketcap
var account = null;

loadPrices();

firebase.database().ref(config.bot+'/state/roi').on('value', function(data){
  roi = data.val();
  console.log("roi: "+roi);  
}, function(error){
  console.log("error loading roi: "+error.message);
  $('#error-message').text('error loading ROI: '+error.message).show();
});

firebase.database().ref(config.bot+'/globalPropertiesSteem').on('value', function(snapshot){
  rewardBalance = snapshot.val().reward_balance;
  recentClaims = snapshot.val().recent_claims;
  votePowerReserveRate = snapshot.val().vote_power_reserve_rate;
  getAccount();
}, function(error){
  console.log("error loading globalPropertiesSteem: "+error.message);
  $('#error-message').text('error loading globalPropertiesSteem: '+error.message).show();
});

function getAccount(){

firebase.database().ref(config.bot+'/account').on('value', function(snapshot){
  account = snapshot.val();  
  getBids();
}, function(error){
  console.log("error loading account: "+error.message);
  $('#error-message').text('error loading account: '+error.message).show();
});

}

function getBids(){

firebase.database().ref(config.bot+'/state/outstanding_bids').on('value', function(snapshot) {
  bids = snapshot.val();
  if(bids == null){
    console.log("There are no Bids");
    $('#success-message').text('There are no Bids').show();
    $('#error-message').hide();
    return;
  }
  
  $('#current-round').html('');
  
  var power = getVotingPower(account);
  var now = new Date();
  var timeToFull = 0;
  
  for(var i=0;i<bids.length;i++){
    bid = bids[i];    
    timeToFull += timeTilFullPower(power);
    time = now.getTime() + timeToFull*1000;
    weight = getWeight(bid)/100;
    used_power = getUsedPower(weight, 10000);
    power = 10000 - used_power;
    
    $('#current-round').append(itemList(bid, new Date(time)));
  }  
}, function(error){
  console.log("error loading the queue: "+error.message);
  $('#error-message').text('error loading the queue: '+error.message).show();
  $('#success-message').hide();
});

}

setInterval(update_timestamp,10000);

function itemList(bid,time){
  return ''+
    '<div class="visibledesktop">'+
      '<div class="bid-item fancy">'+
        '<a href="https://steemit.com/@'+bid.author+'" class="picture-profile">'+
          '<div class="crop2" style="background-image: url(https://steemitimages.com/u/'+bid.author+'/avatar/small);">'+
          '</div>'+
        '</a>'+  
        '<div class="bid-item-name"><a href="https://steemit.com/@'+bid.author+'">'+bid.author+'</a></div>'+
        '<div class="bid-title"><a href="https://steemit.com'+bid.url+'">'+bid.title+'</a></div>'+
        '<div class="bid-amount">'+bid.amount+' '+bid.currency+'</div>'+
        '<div class="time-vote" data-time="'+time.getTime()+'">'+textNextVote(time)+'</div>'+
      '</div>'+
    '</div>'+
    '<div class="visibledevice">'+
      '<div class="bid-item fancy">'+
        '<div class="field-device" style="width:100%;">'+
          '<a href="https://steemit.com/@'+bid.author+'" class="field-device33">'+
            '<div class="crop2" style="background-image: url(https://steemitimages.com/u/'+bid.author+'/avatar/small);">'+
            '</div>'+
          '</a>'+
          '<div class="bid-item-name-device"><a href="https://steemit.com/@'+bid.author+'" style="margin:auto;">'+bid.author+'</a></div>'+
          '<div class="field-device33" style="font-size:0.8rem; margin-bottom:10px;"><a href="https://steemit.com/'+bid.url+'">'+bid.title+'</a></div>'+
          '<div class="field-device33" style="font-size:0.8rem;">Bid: '+bid.amount+' '+bid.currency+'</div>'+
          '<div class="field-device33" style="font-size:0.8rem;" time-vote" data-time="'+time.getTime()+'">vote in '+textNextVote(time)+'</div>'+
        '</div>'+
      '</div>'+
    '</div>';
}

function textNextVote(t){
  var now = new Date();
  var minutes = Math.floor((t-now)/(60 * 1000));
  var seconds = Math.floor((t-now)/1000 - 60*minutes);
  if(minutes<0){ minutes=0; seconds=0; }
      
  text = '';
  if(minutes == 0) text = text + seconds + ' seconds';
  else if(minutes == 1) text = text + '1 minute';
  else text = text + minutes + ' minutes';
  return text;      
}

function update_timestamp() {
  $(".time-vote").each(function() {
    var time = new Date(parseInt($(this).attr('data-time')));
    if(!isnan(time)) $(this).text(textNextVote(time));        
  });  
}