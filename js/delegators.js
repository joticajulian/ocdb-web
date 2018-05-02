var steem_per_mvests = -1;
var totalVests = 0;
var state;
var incomeDaySTEEM = 0;
var incomeDaySBD = 0;

var database = firebase.database();

firebase.database().ref(config.bot+'/globalPropertiesSteem').on('value', function(snapshot){
  steem_per_mvests = snapshot.val().steem_per_mvests;
  console.log("steem_per_mvests: "+steem_per_mvests);
}, function(error){
  console.log(error);
  console.log("error loading globalPropertiesSteem: "+error.message);
});

firebase.database().ref(config.bot+'/state').on('value', function(snapshot){
  state = snapshot.val();
  incomeDaySTEEM = parseFloat(state.steem_balance);
  incomeDaySBD = parseFloat(state.sbd_balance);
  
  $('#income-day').text('Income of the day: '+incomeDaySTEEM.toFixed(3)+' STEEM + '+incomeDaySBD.toFixed(3)+' SBD.');
  
  console.log("Income day Steem: "+incomeDaySTEEM);
  console.log("Income day SBD: "+incomeDaySBD);
});

firebase.database().ref(config.bot+'/delegators').on('value', function(snapshot) {
  delegators = snapshot.val();
  totalVests = delegators.reduce(function (total, v) { return total + parseFloat(v.vesting_shares); }, 0);
  console.log('Delegators: '+delegators.length);
  console.log('Total Vests: '+totalVests);
  
  $('#delegators').html('');
  for(var i=0;i<delegators.length;i++) {
    $('#delegators').append(tableDelegator(delegators[i]));   
  } 
});

function vestsToSP(vests) { return vests / 1000000 * steem_per_mvests; }

function tableDelegator(delegator){
  var vesting_shares = parseFloat(delegator.vesting_shares);
  
  var delegation = vestsToSP(vesting_shares).toFixed(3) + ' SP';
  if(typeof delegator.new_vesting_shares !== 'undefined') { 
    delegation = delegation + ' (new change: '+vestsToSP(parseFloat(delegator.new_vesting_shares)).toFixed(3)+' SP)';
  }else if(vesting_shares == 0) return '';
  
  pendingPayoutSTEEM = incomeDaySTEEM * vesting_shares / totalVests - 0.001;
  pendingPayoutSBD = incomeDaySBD * vesting_shares / totalVests - 0.001;
  
  if(isNaN(pendingPayoutSTEEM) || pendingPayoutSTEEM <0) pendingPayoutSTEEM = 0;
  if(isNaN(pendingPayoutSBD  ) || pendingPayoutSBD   <0) pendingPayoutSBD   = 0;
  
  return ''+
    '<tr>'+
      '<td>'+delegator.delegator+'</td>'+
      '<td>'+delegation+'</td>'+
      '<td>'+pendingPayoutSTEEM.toFixed(3)+'</td>'+
      '<td>'+pendingPayoutSBD.toFixed(3)+'</td>'+
    '</tr>';    
}

