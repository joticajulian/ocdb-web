var steem_per_mvests = -1;
var totalVests = 0;
var state;
var incomeDaySTEEM = 0;
var incomeDaySBD = 0;
var incomeDaySP = 0;
var user_is_delegator = false;

var database = firebase.database();

firebase.database().ref(config.bot+'/globalPropertiesSteem').on('value', function(snapshot){
  steem_per_mvests = snapshot.val().steem_per_mvests;
  console.log("steem_per_mvests: "+steem_per_mvests);
}, function(error){
  console.log("error loading globalPropertiesSteem: "+error.message);
  $('#error-message').text('error loading globalPropertiesSteem: '+error.message).show();
});

firebase.database().ref(config.bot+'/state').on('value', function(snapshot){
  state = snapshot.val();
  incomeDaySTEEM = parseFloat(state.steem_balance);
  incomeDaySBD = parseFloat(state.sbd_balance);
  incomeDaySP = parseFloat(state.steem_power_balance);  
  liquid_steem_power = parseFloat(state.steem_reserve_balance);
  
  $('#income-day').text(incomeDaySTEEM.toFixed(3)+' STEEM + '+incomeDaySBD.toFixed(3)+' SBD + '+incomeDaySP.toFixed(3)+' SP');
  $('#liquid-steem-power').text(liquid_steem_power.toFixed(3)+' STEEM');
  $('#actual-roi').text(state.roi);
  
  console.log("Income day Steem: "+incomeDaySTEEM);
  console.log("Income day SBD: "+incomeDaySBD);
  console.log("Income day SP: "+incomeDaySP);
  console.log("Liquid steem power: "+liquid_steem_power);
  console.log("ROI: "+state.roi);
}, function(error){
  console.log("error loading state: "+error.message);
  $('#error-message').text('error loading state: '+error.message).show();
});

firebase.database().ref(config.bot+'/max_bid_sbd').on('value', function(snapshot){
  bid = snapshot.val();
  $('#actual-max-bid').text(bid);
  console.log("Max bid sbd: "+bid);
});

firebase.database().ref(config.bot+'/min_bid_sbd').on('value', function(snapshot){
  bid = snapshot.val();
  $('#actual-min-bid').text(bid);
  console.log("Min bid sbd: "+bid);
});

firebase.database().ref(config.bot+'/comment').on('value', function(snapshot){
  var comment = snapshot.val();
  $('#actual-comment').html(getContentHtml(comment));  
  //$('#actual-comment-preview').text(comment.replace(/\{weight\}/g, '51.35').replace(/\{botname\}/g, 'ocdb').replace(/\{sender\}/g, 'acidyo').replace(/\{author\}/g, 'jga'));
  console.log("comment: "+comment);
});

firebase.database().ref(config.bot+'/delegators').on('value', function(snapshot) {
  delegators = snapshot.val();
  totalVests = 0;
  var length = 0;
  for(var d in delegators){
    totalVests += parseFloat(delegators[d].vesting_shares);
    length++;    
  }
  
  console.log('Delegators: '+length);
  console.log('Total Vests: '+totalVests);
  
  $('.delegators').html('');
  var i=1;
  for(var d in delegators){
    if(!isActiveDelegator(delegators[d])) continue;
    //if(!isDelegatorToShow(delegators[d])) continue;
    $('.delegators').append(itemDelegator(d,delegators[d]));      
  } 
}, function(error){
  console.log("error loading delegators: "+error.message);
  $('#error-message').text('error loading delegators: '+error.message).show();
});

firebase.database().ref(config.bot+'/debt').on('value', function(snapshot) {
  debt = snapshot.val();
  
  $('.debt').html('');
  var i=1;
  for(var d in debt){
    var isDebt = false;
    if(debt[d].steem && debt[d].steem>0) isDebt = true;
    if(debt[d].sbd && debt[d].sbd>0) isDebt = true;
    
    if(isDebt) $('.debt').append(itemDebt(d,debt[d]));
    else console.log("No debt to show");
  } 
}, function(error){
  console.log("error loading debt: "+error.message);
  $('#error-message').text('error loading debt: '+error.message).show();
});

$(function(){
  
});  

function vestsToSP(vests) { return vests / 1000000 * steem_per_mvests; }

function isActiveDelegator(delegator){
  var vesting_shares = parseFloat(delegator.vesting_shares);
  if(typeof delegator.new_vesting_shares === 'undefined' && vesting_shares == 0) return false;
  return true;  
}

function itemDebt(name,data){
  var steem = 0;
  var sbd = 0;
 
  if(data.steem) steem = data.steem;
  if(data.sbd) sbd = data.sbd;
  
  return ''+ 
    '<div class="card-delegator">'+
      '<div class="header-delegator">'+
        '<div class="crop3" style="background-image: url(https://steemitimages.com/u/'+name+'/avatar/small);"></div>'+
        '<div class="username">@'+name+'</div>'+
      '</div>'+
      '<div class="data-delegator">'+
        '<div class="item-data">'+steem+' STEEM</div>'+
        '<div class="item-data">'+sbd+' SBD</div>'+        
      '</div>'+
    '</div>';
}

function itemDelegator(name,delegator){
  var vesting_shares = parseFloat(delegator.vesting_shares);
  
  var delegation = vestsToSP(vesting_shares).toFixed(3) + ' SP';
  if(typeof delegator.new_vesting_shares !== 'undefined') { 
    delegation = delegation + ' (new change: '+vestsToSP(parseFloat(delegator.new_vesting_shares)).toFixed(3)+' SP)';
  }else if(vesting_shares == 0) return '';
  
  var perc_sbd = parseFloat(delegator.sbd_reward_percentage) / 100;
  var perc_steem = perc_sbd;
  var perc_sp = parseFloat(delegator.curation_reward_percentage) / 100;
  
  perc_sbd = perc_sbd < 0 ? 0 : (perc_sbd>1 ? 1 : perc_sbd);
  perc_steem = perc_steem < 0 ? 0 : (perc_steem>1 ? 1 : perc_steem);            
  perc_sp = perc_sp < 0 ? 0 : (perc_sp>1 ? 1 : perc_sp);
  
  var amountSTEEM = incomeDaySTEEM * vesting_shares / totalVests - 0.001;
  var amountSBD   = incomeDaySBD *   vesting_shares / totalVests - 0.001;
  var amountSP    = incomeDaySP * vesting_shares / totalVests - 0.001;
  
  pendingPayoutSTEEM = amountSTEEM * perc_steem;
  pendingPayoutSBD = amountSBD * perc_sbd;
  pendingPayoutSP = amountSP * perc_sp;
  
  pendingDonationSTEEM = amountSTEEM - pendingPayoutSTEEM;
  pendingDonationSBD   = amountSBD - pendingPayoutSBD;
  pendingDonationSP    = amountSP - pendingPayoutSP;
  
  if(isNaN(pendingPayoutSTEEM) || pendingPayoutSTEEM <0) pendingPayoutSTEEM = 0;
  if(isNaN(pendingPayoutSP   ) || pendingPayoutSP    <0) pendingPayoutSP    = 0;
  if(isNaN(pendingPayoutSBD  ) || pendingPayoutSBD   <0) pendingPayoutSBD   = 0;
  
  if(isNaN(pendingDonationSTEEM) || pendingDonationSTEEM <0) pendingDonationSTEEM = 0;
  if(isNaN(pendingDonationSP   ) || pendingDonationSP    <0) pendingDonationSP    = 0;
  if(isNaN(pendingDonationSBD  ) || pendingDonationSBD   <0) pendingDonationSBD   = 0;
  
  var totalDonationSBD = 0;
  var totalDonationSTEEM = 0;
  var totalDonationSP = 0;
  
  if(delegator.donation_sbd) totalDonationSBD = delegator.donation_sbd;
  if(delegator.donation_steem) totalDonationSTEEM = delegator.donation_steem;
  if(delegator.donation_sp) totalDonationSP = delegator.donation_sp;
  
  return ''+ 
    '<div class="card-delegator">'+
      '<div class="header-delegator">'+
        '<div class="crop3" style="background-image: url(https://steemitimages.com/u/'+name+'/avatar/small);"></div>'+
        '<div class="username">@'+name+'</div>'+
      '</div>'+
      '<div class="data-delegator">'+
        '<div class="item-data"><span class="title-item">Delegation:</span>'+delegation+'</div>'+
        '<div class="item-data"><span class="title-item">SBD/STEEM payments:</span>'+delegator.sbd_reward_percentage+'%</div>'+
        '<div class="item-data"><span class="title-item">Curation payments:</span>'+delegator.curation_reward_percentage+'%</div>'+
        '<div class="item-data"><span class="title-item">Pending payout:</span>'+pendingPayoutSBD.toFixed(3)+' SBD<br>'+pendingPayoutSTEEM.toFixed(3)+' STEEM<br>'+pendingPayoutSP.toFixed(3)+' SP</div>'+
        '<div class="item-data"><span class="title-item">Pending donation:</span>'+pendingDonationSBD.toFixed(3)+' SBD<br>'+pendingDonationSTEEM.toFixed(3)+' STEEM<br>'+pendingDonationSP.toFixed(3)+' SP</div>'+
        '<div class="item-data"><span class="title-item">Total donation:</span>'+totalDonationSBD.toFixed(3)+' SBD<br>'+totalDonationSTEEM.toFixed(3)+' STEEM<br>'+totalDonationSP.toFixed(3)+' SP</div>'+
      '</div>'+
    '</div>';     
}

function setMinBid(){
  var bid = parseFloat($('#set-min-bid').val());
  bid = parseInt(1000*bid) / 1000;
  if(bid>=0){
    console.log("Setting min bid: ");
    console.log(bid);
    firebase.database().ref(config.bot+'/min_bid_sbd').set(bid)
    .then(function() {
      console.log("Successfull");
      $('#error-message-modify').hide();
      $('#success-message-modify').text('New min bid: '+bid.toFixed(3)+ ' SBD').show(); 
    })
    .catch(function(error) {
      console.log('Error: '+error.message);
      $('#success-message-modify').hide();
      $('#error-message-modify').text('Error: '+error.message).show();
    });    
  }else{
    $('#error-message-modify').text("Error: Number misspelled in min bid").show();
    $('#success-message-modify').hide();
  }  
}

function setMaxBid(){
  var bid = parseFloat($('#set-max-bid').val());
  bid = parseInt(1000*bid) / 1000;
  if(bid>=0){
    console.log("Setting max bid: ");
    console.log(bid);
    firebase.database().ref(config.bot+'/max_bid_sbd').set(bid)
    .then(function() {
      console.log("Successfull");
      $('#error-message-modify').hide();
      $('#success-message-modify').text('New max bid: '+bid.toFixed(3)+ ' SBD').show();
    })
    .catch(function(error) {
      console.log('Error: '+error.message);
      $('#success-message-modify').hide();
      $('#error-message-modify').text('Error: '+error.message).show();
    });
  }else{
    $('#error-message-modify').text("Error: Number misspelled in max bid").show();
    $('#success-message-modify').hide();
  }
}

function setROI(){
  var roi = parseFloat($('#set-roi').val());
  if(roi>=0){
    console.log("Setting ROI: ");
    console.log(roi);
    firebase.database().ref(config.bot+'/state/roi').set(roi)
    .then(function() {
      console.log("Successfull");
      $('#error-message-modify').hide();
    $('#success-message-modify').text('New ROI factor: '+roi).show();
    })
    .catch(function(error) {
      console.log('Error: '+error.message);
      $('#success-message-modify').hide();
      $('#error-message-modify').text('Error: '+error.message).show();
    });
  }else{
    $('#error-message-modify').text("Error: Number misspelled in ROI").show();
    $('#success-message-modify').hide();
  } 
}

function setBidsPerDay(){
  var bidsperday = parseFloat($('#set-bids-per-day').val());
  if(bidsperday>=0){
    console.log("Setting bids per day: ");
    console.log(bidsperday);
    firebase.database().ref(config.bot+'/config/bids_per_day').set(bidsperday)
    .then(function() {
      console.log("Successfull");
      $('#error-message-modify').hide();
      $('#success-message-modify').text('New bids per day: '+bidsperday).show();
    })
    .catch(function(error) {
      console.log('Error: '+error.message);
      $('#success-message-modify').hide();
      $('#error-message-modify').text('Error: '+error.message).show();
    });
  }else{
    $('#error-message-modify').text("Error: Number misspelled in bids per day").show();
    $('#success-message-modify').hide();
  } 
}

function setMinPostAge(){
  var value = parseFloat($('#set-min-post-age').val());
  if(value>=0){
    console.log("Setting min post age: ");
    console.log(value);
    firebase.database().ref(config.bot+'/config/min_post_age').set(value)
    .then(function() {
      console.log("Successfull");
      $('#error-message-modify').hide();
      $('#success-message-modify').text('New min post age: '+secondsToString(value)).show();
    })
    .catch(function(error) {
      console.log('Error: '+error.message);
      $('#success-message-modify').hide();
      $('#error-message-modify').text('Error: '+error.message).show();
    });
  }else{
    $('#error-message-modify').text("Error: Number misspelled in min post age").show();
    $('#success-message-modify').hide();
  } 
}

function setMaxPostAge(){
  var value = parseFloat($('#set-max-post-age').val());
  if(value>=0){
    console.log("Setting max post age: ");
    console.log(value);
    firebase.database().ref(config.bot+'/config/max_post_age').set(value)
    .then(function() {
      console.log("Successfull");
      $('#error-message-modify').hide();
      $('#success-message-modify').text('New max post age: '+secondsToString(value)).show();
    })
    .catch(function(error) {
      console.log('Error: '+error.message);
      $('#success-message-modify').hide();
      $('#error-message-modify').text('Error: '+error.message).show();
    });
  }else{
    $('#error-message-modify').text("Error: Number misspelled in max post age").show();
    $('#success-message-modify').hide();
  } 
}

function setComment(){
  var comment = $('#set-comment').val();
  console.log("Setting comment: ");
  console.log(comment);
  firebase.database().ref(config.bot+'/comment').set(comment)
  .then(function() {
    console.log("Successfull");
    $('#error-message-modify').hide();
  $('#success-message-modify').html('New comment: '+comment).show();
  })
  .catch(function(error) {
    console.log('Error: '+error.message);
    $('#success-message-modify').hide();
    $('#error-message-modify').text('Error: '+error.message).show();
  });   
}
