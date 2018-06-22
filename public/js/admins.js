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
  
  console.log("Income day Steem: "+incomeDaySTEEM);
  console.log("Income day SBD: "+incomeDaySBD);
  console.log("Income day SP: "+incomeDaySP);
  console.log("Liquid steem power: "+liquid_steem_power);
}, function(error){
  console.log("error loading state: "+error.message);
  $('#error-message').text('error loading state: '+error.message).show();
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