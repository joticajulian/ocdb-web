var STEEMIT_100_PERCENT = 10000;
var STEEMIT_VOTE_REGENERATION_SECONDS = (5 * 60 * 60 * 24);
var HOURS = 60 * 60;

function isDesktop(){
  return $(window).width() >= 500;
}

function getVotingPower(account) {
  var voting_power = account.voting_power;
  var last_vote_time = new Date((account.last_vote_time) + 'Z');
  var elapsed_seconds = (new Date() - last_vote_time) / 1000;
  var regenerated_power = Math.round((STEEMIT_100_PERCENT * elapsed_seconds) / STEEMIT_VOTE_REGENERATION_SECONDS);
  var current_power = Math.min(voting_power + regenerated_power, STEEMIT_100_PERCENT);
  return current_power;
}

function getVoteValue(voteWeight, account, power) {
  if (!account) {
    return;
  }
  if (rewardBalance && recentClaims && steemPrice && votePowerReserveRate) {
    var voteValue = getVoteRShares(voteWeight, account, power)
      * rewardBalance / recentClaims
      * steemPrice;

    return voteValue;

  }
}

function timeTilFullPower(cur_power){
  return (STEEMIT_100_PERCENT - cur_power) * STEEMIT_VOTE_REGENERATION_SECONDS / STEEMIT_100_PERCENT;
}

function getVoteRShares(voteWeight, account, power) {
  if (!account) {
    return;
  }

  if (rewardBalance && recentClaims && steemPrice && votePowerReserveRate) {
    var effective_vesting_shares = Math.round(getVestingShares(account) * 1000000);
    var used_power = getUsedPower(voteWeight, power);
    var rshares = Math.round((effective_vesting_shares * used_power) / (STEEMIT_100_PERCENT));
    return rshares;
  }
}

function getUsedPower(voteWeight, power){
  if (!account) {
    return;
  }

  if (votePowerReserveRate) {
    var weight = voteWeight * 100;    
    var current_power = power;
    var max_vote_denom = votePowerReserveRate * STEEMIT_VOTE_REGENERATION_SECONDS / (60 * 60 * 24);
    var used_power = Math.round((current_power * weight) / STEEMIT_100_PERCENT);
    used_power = Math.round((used_power + max_vote_denom - 1) / max_vote_denom);
    return used_power;
  }
}

function getVestingShares(account) {
  var effective_vesting_shares = parseFloat(account.vesting_shares.replace(" VESTS", ""))
    + parseFloat(account.received_vesting_shares.replace(" VESTS", ""))
    - parseFloat(account.delegated_vesting_shares.replace(" VESTS", ""));
  return effective_vesting_shares;
}

function getUsdValue(bid) {
  return bid.amount * ((bid.currency == 'SBD') ? sbdPrice : steemPrice); 
}

function getWeight(bid){
  var vote_value = getVoteValue(100, account, 10000);
  var vote_value_usd = vote_value / 2 * sbdPrice + vote_value / 2;
  
  var weight = Math.round(10000 * roi * getUsdValue(bid)/vote_value_usd);
  weight = weight > 10000 ? 10000 : weight;
  return weight;
}

function loadPrices() {
  $.get('https://api.coinmarketcap.com/v1/ticker/steem/', function (e, r, data) {
    try {
      steemPrice = parseFloat(data.responseJSON[0].price_usd);
      console.log("Loaded STEEM price: " + steemPrice);
    } catch (err) {
      console.log('Error loading STEEM price: ' + err);
      console.log(data);
    }
  });

  // Load the price feed data
  $.get('https://api.coinmarketcap.com/v1/ticker/steem-dollars/', function (e, r, data) {
    try {
      sbdPrice = parseFloat(data.responseJSON[0].price_usd);
      console.log("Loaded SBD price: " + sbdPrice);
    } catch (err) {
      console.log('Error loading SBD price: ' + err);
    }
  });
}

function formatTime(t){
  return t.getFullYear()+'-'+addZero(t.getMonth()+1)+'-'+addZero(t.getDate())+'T'+addZero(t.getHours())+':'+addZero(t.getMinutes())+':'+addZero(t.getSeconds()); 
}

function addZero(x){
  if(x < 10) return "0"+x;
  else return ""+x;
}