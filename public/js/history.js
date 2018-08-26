var bot = {
  name: 'ocdb',
};

var steem_per_mvests = -1;

STATUS_INCOME_BID = 1;
STATUS_VOTED = 2;
STATUS_COMMENTED = 3;
STATUS_VOTED_COMMENTED = 4;
STATUS_VOTED_NO_BID = 5;
STATUS_COMMENTED_NO_BID = 6;
STATUS_VOTED_COMMENTED_NO_BID = 7;
STATUS_REFUND = 8;
STATUS_REFUND_NO_BID = 9;
STATUS_DONATION = 10;
STATUS_DELEGATION = 11;
STATUS_PAYMENT = 12;

steemit = 'https://steemit.com';
var num_trans = 300;
var no_display = 15; //no display last 15 items
var hist = [];

$(function(){
  firebase.database().ref(config.bot+'/globalPropertiesSteem').once('value', function(snapshot){
    steem_per_mvests = snapshot.val().steem_per_mvests;
    console.log("steem_per_mvests: "+steem_per_mvests);
    
    consultHistory();
  }, function(error){
    console.log("error loading globalPropertiesSteem: "+error.message);
    $('#error-message').text('error loading globalPropertiesSteem: '+error.message).show();
  });  
});

function consultHistory(){

steem.api.getAccountHistory(bot.name, -1, num_trans, function (err, result) {
  if (err || !result) {
    console.log('Error loading account history: ' + err);
    return;
  }
    
  for (var i = 0; i < result.length; i++) {
    var trans = result[i];
    var op = trans[1].op;
    var t_id = parseInt(trans[0]);
    var trx_id = trans[1].trx_id;
    var timestamp = trans[1].timestamp;

    //payment
    if(op[0] == 'transfer' && op[1].from == bot.name && op[1].memo.substring(0,1)=='#'){
      var item = {
        type: 'payment',
        id: [t_id],
        trx_id: [trx_id],
        user: op[1].to,
        amount: op[1].amount,
        timestamp: [timestamp],
        status: STATUS_PAYMENT,
      };
      hist.push(item);    
    
    //transfer
    } else if (op[0] == 'transfer' && op[1].to == bot.name) {
       
      if(op[1].memo.substring(0,8).toLowerCase() == 'transfer'){
        var item = {
          type: 'transfer',
          id: [t_id],
          trx_id: [trx_id],
          user: op[1].from,
          amount: op[1].amount,
          memo:   op[1].memo,
          timestamp: [timestamp],
          status: STATUS_DONATION,
        };      
      }else if(op[1].memo.substring(0,4).toLowerCase() != 'http'){
        var item = {
          type: 'transfer',
          id: [t_id],
          trx_id: [trx_id],
          user: op[1].from,
          amount: op[1].amount,
          memo:   op[1].memo,
          timestamp: [timestamp],
          status: STATUS_DONATION,
        };      
      }else{
        //Incoming Bid
        var item = {
          type: 'bid',
          id: [t_id],
          trx_id: [trx_id],
          user: op[1].from,
          amount: op[1].amount,
          memo: op[1].memo,
          timestamp: [timestamp],
          status: STATUS_INCOME_BID,
        };  
      }
      hist.push(item);
     
    //delegation
    } else if(op[0] == 'delegate_vesting_shares' && op[1].delegatee == bot.name){
      var item = {
        type: 'delegation',
        id: [t_id],
        trx_id: [trx_id],
        user: op[1].delegator,
        amount: op[1].vesting_shares,
        steem_power: (steem_per_mvests * parseFloat(op[1].vesting_shares) / 1000000),
        timestamp: [timestamp],
        status: STATUS_DELEGATION,
      };
      hist.push(item);

    //vote        
    } else if(op[0] == 'vote' && op[1].voter == bot.name){
      var bid = {
        type: 'bid',
        memo: op[1].author + '/' + op[1].permlink,
        status: STATUS_INCOME_BID,
      }      
      var id = search_in_history(bid);
      if(id >= 0){
        hist[id].status = STATUS_VOTED;
        hist[id].weight = op[1].weight;
        hist[id].id.push(t_id);
        hist[id].trx_id.push(trx_id);
        hist[id].timestamp.push(timestamp);
      }else{
        var item = {
          type: 'bid',
          id: [t_id],
          trx_id: [trx_id],
          user: op[1].author + '?',
          amount: '???',
          memo: steemit + '/@' + op[1].author + '/' + op[1].permlink,            
          weight: op[1].weight,
          timestamp: [timestamp],
          status: STATUS_VOTED_NO_BID,            
        };
        hist.push(item);
      }      
      
    //comment
    //TODO: implement
    } else if(op[0] == 'comment' && op[1].author == bot.name){
      /*op[1].parent_permlink
      op[1].parent_author*/
    
    //refund
    } else if(op[0] == 'transfer' && op[1].from == bot.name){
      var bid = { 
        type: 'bid',
        user: op[1].to,
        amount: op[1].amount,
        status: STATUS_INCOME_BID,
      };
      var id = search_in_history(bid);
      if(id>=0){
        hist[id].status = STATUS_REFUND;
        hist[id].refund = op[1].memo;
        hist[id].id.push(t_id);
        hist[id].trx_id.push(trx_id);
        hist[id].timestamp.push(timestamp);
      }else{
        var item = {
          type: 'bid',
          id: [t_id],
          trx_id: [trx_id],
          user: op[1].to,
          amount: op[1].amount,
          memo: op[1].memo,
          refund: op[1].memo,
          timestamp: [timestamp],
          status: STATUS_REFUND_NO_BID,
        };
        hist.push(item);
      }  
    }
  }
  
  //display
  if(hist.length > 0)
    for(var i=hist.length-1; i>=no_display ; i--){
      $('#history').append(itemList(hist[i]));
    }     
});

}
        
function search_in_history(bid){
  if(hist.length > 0)
  for(var i=hist.length-1; i>=0 ; i--){
    var found = true;
    for(var key in bid){
      if(!hist[i][key]){
        found = false;
        break;
      }  
      
      if(key == 'memo'){
        if(hist[i].memo.indexOf(bid.memo) == -1){
          found = false;
          break;
        }  
      }else{      
        if(hist[i][key] != bid[key]){
          found = false;
          break;
        }
      }              
    }
    
    if(found) return i;
  }
  return -1;  
}

function itemList(item){
  var status = 'no status';
  var description = item.memo;
  var auxClass = '';
  var titleStatus = '';
  switch(item.status){
    case STATUS_INCOME_BID:
      status = 'Waiting vote';
      auxClass = '-red';
      break;
    case STATUS_VOTED:
    case STATUS_VOTED_COMMENTED:
      status = '<a href="https://steemd.com/tx/' + item.trx_id[1] + '">Voted ('+(item.weight/100).toFixed(2)+'%)</a>';
      titleStatus = 'title="'+item.timestamp[1]+'"';
      break;
    case STATUS_VOTED_NO_BID:
    case STATUS_VOTED_COMMENTED_NO_BID:
      status = '<a href="https://steemd.com/tx/' + item.trx_id[0] + '">Voted no bid ('+(item.weight/100).toFixed(2)+'%)</a>';
      titleStatus = 'title="'+item.timestamp[0]+'"';
      auxClass = '-red';
      break;
    case STATUS_REFUND:
      status = '<a href="https://steemd.com/tx/' + item.trx_id[1] + '">Refund: ' + typeRefund(item.refund) +'</a>';
      titleStatus = 'title="'+item.timestamp[1]+'"';
      auxClass = '-yellow';
      break;
    case STATUS_REFUND_NO_BID:
      status = '<a href="https://steemd.com/tx/' + item.trx_id[0] + '">Refund no bid: ' + typeRefund(item.refund) +'</a>';
      titleStatus = 'title="'+item.timestamp[0]+'"';
      auxClass = '-red';
      break;
    case STATUS_DONATION:
      status = 'Donation';
      auxClass = '-gray';
      break;
    case STATUS_DELEGATION:
      status = 'Delegation';
      auxClass = '-gray';
      description = 'Delegation of ' + item.steem_power.toFixed(3) + ' Steem Power';
      break;
    case STATUS_PAYMENT:
      status = 'Payment';
      auxClass = '-gray';
      description = 'Daily payment to delegator';
      break;
    //case STATUS_COMMENTED:
    //case STATUS_COMMENTED_NO_BID:  
    default:
      break;
  }
  
  return ''+
    '<div class="visibledesktop">'+
      '<div class="bid-item fancy'+auxClass+'">'+
        '<a href="https://steemit.com/@'+item.user+'" class="picture-profile">'+
          '<div class="crop2" style="background-image: url(https://steemitimages.com/u/'+item.user+'/avatar/small);">'+
          '</div>'+
        '</a>'+  
        '<div class="bid-item-name"><a href="https://steemit.com/@'+item.user+'">'+item.user+'</a></div>'+
        '<div class="bid-title"><a href="'+item.memo+'">'+description+'</a></div>'+
        '<div class="bid-amount" title="'+item.timestamp[0]+'"><a href="https://steemd.com/tx/' + item.trx_id[0] + '">' + item.amount + '</a></div>'+
        '<div class="time-vote" '+titleStatus+'>'+status+//'<br><span style="display:block;">('+ids+')</span></div>'+
      '</div>'+
    '</div>';    
}

function typeRefund(memo){
  if(memo.indexOf('The bot is currently disabled') >= 0)  return 'Bot disabled';
  if(memo.indexOf('Min bid amount is') >= 0)              return 'Amount';
  if(memo.indexOf('Max bid amount is') >= 0)              return 'Amount';
  if(memo.indexOf('Bids not allowed on comments') >= 0)   return 'No comments';
  if(memo.indexOf('Bot already voted on this post') >= 0) return 'Voted';
  if(memo.indexOf('Posts cannot be older than') >= 0)     return '3 days';
  if(memo.indexOf('Invalid post URL in memo') >= 0)       return 'Bad URL';
  if(memo.indexOf('tag which is not allowed') >= 0)       return 'Tag';
  if(memo.indexOf('accepted every 24 hours') >= 0)        return '1 per day';
  if(memo.indexOf('whitelisted authors') >= 0)            return 'Whitelist';
  return '';
}