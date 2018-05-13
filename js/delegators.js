var steem_per_mvests = -1;
var totalVests = 0;
var state;
var incomeDaySTEEM = 0;
var incomeDaySBD = 0;
var liquid_steem_power = 0;
var user_is_delegator = false;

var database = firebase.database();

firebase.database().ref(config.bot+'/globalPropertiesSteem').on('value', function(snapshot){
  steem_per_mvests = snapshot.val().steem_per_mvests;
  console.log("steem_per_mvests: "+steem_per_mvests);
}, function(error){
  console.log("error loading globalPropertiesSteem: "+error.message);
  $('error-message').text('error loading globalPropertiesSteem: '+error.message).show();
});

firebase.database().ref(config.bot+'/state').on('value', function(snapshot){
  state = snapshot.val();
  incomeDaySTEEM = parseFloat(state.steem_balance);
  incomeDaySBD = parseFloat(state.sbd_balance);
  liquid_steem_power = state.steem_reserve_balance >= state.steem_power_balance ? state.steem_power_balance : state.steem_reserve_balance;
  
  $('#income-day').text(incomeDaySTEEM.toFixed(3)+' STEEM + '+incomeDaySBD.toFixed(3)+' SBD');
  
  console.log("Income day Steem: "+incomeDaySTEEM);
  console.log("Income day SBD: "+incomeDaySBD);
  console.log("Income day SP: "+liquid_steem_power);
}, function(error){
  console.log("error loading state: "+error.message);
  $('error-message').text('error loading state: '+error.message).show();
});

firebase.database().ref(config.bot+'/delegators').on('value', function(snapshot) {
  delegators = snapshot.val();
  totalVests = 0;
  var length = 0;
  for(var d in delegators){
    totalVests += parseFloat(delegators[d].vesting_shares);
    length++;
    if(d == username){
      user_is_delegator = true;
      var percSBD = delegators[d].sbd_reward_percentage;
      var percCuration = delegators[d].curation_reward_percentage;
      $('#sbdsteem-rewards').prop('checked', percSBD>0);
      $('#curation-rewards').prop('checked', percCuration>0);
      $('#slide-sbd-steem').val(percSBD);
      $('#slide-curation').val(percCuration);
    }
  }
  
  if(user_is_delegator){
    $('#custom-rewards-option').show();
    $('#current-delegator').html(tableDelegator(username,delegators[username])).show();
    console.log('@'+username+' is a delegator');
  }else{
    $('#custom-rewards-option').hide();
    $('#current-delegator).hide();
    console.log('@'+username+' is not a delegator');
  }
  
  console.log('Delegators: '+length);
  console.log('Total Vests: '+totalVests);
  
  $('#delegators').html('');
  for(var d in delegators) $('#delegators').append(tableDelegator(d,delegators[d]));  
}, function(error){
  console.log("error loading delegators: "+error.message);
  $('error-message').text('error loading delegators: '+error.message).show();
});

function vestsToSP(vests) { return vests / 1000000 * steem_per_mvests; }

function tableDelegator(name,delegator){
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
  
  pendingPayoutSTEEM = incomeDaySTEEM * perc_steem * vesting_shares / totalVests - 0.001;
  pendingPayoutSBD = incomeDaySBD * perc_sbd * vesting_shares / totalVests - 0.001;
  pendingPayoutSP = liquid_steem_power * perc_sp * vesting_shares / totalVests - 0.001;
  
  if(isNaN(pendingPayoutSTEEM) || pendingPayoutSTEEM <0) pendingPayoutSTEEM = 0;
  if(isNaN(pendingPayoutSP   ) || pendingPayoutSP    <0) pendingPayoutSP    = 0;
  if(isNaN(pendingPayoutSBD  ) || pendingPayoutSBD   <0) pendingPayoutSBD   = 0;
  
  pendingPayoutSTEEM += pendingPayoutSP;
  
  return ''+  
    '<div class="table">'+
      '<div class="field"><div class="crop2"><img src="https://steemitimages.com/u/'+name+'/avatar/small" class="delegators-img"/></div></div>'+
      '<div class="field">'+name+'</div>'+
      '<div class="field">'+delegation+'</div>'+
      '<div class="field">'+pendingPayoutSTEEM.toFixed(3)+'</div>'+
      '<div class="field">'+pendingPayoutSBD.toFixed(3)+'</div>'+
    '</div>';   
}

function saveDelegator(){
  var receiveSBD = $('#sbdsteem-rewards').is(':checked')? true : false;
  var receiveCuration = $('#curation-rewards').is(':checked')? true : false;
  var percSBD = parseFloat($('#slide-sbd-steem').val());
  var percCuration = parseFloat($('#slide-curation').val());
  
  if(user_is_delegator){
    if(!receiveSBD) percSBD = 0;
    if(!receiveCuration) percCuration = 0;
    console.log("curation_reward_percentage: "+percCuration);
    console.log("sbd_reward_percentage: "+percSBD);
    firebase.database().ref(config.bot+'/delegators/'+username+'/sbd_reward_percentage').set(percSBD);
    firebase.database().ref(config.bot+'/delegators/'+username+'/curation_reward_percentage').set(percCuration);
  }
}

