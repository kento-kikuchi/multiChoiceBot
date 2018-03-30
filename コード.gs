var prop = PropertiesService.getScriptProperties().getProperties();
var slackApp = SlackApp.create(prop.token);
var hook_token = prop.incoming_webhook_token;

function doGet(e) {
  doPost(e);
}
function doPost(e) {

  //slackのスラッシュコマンドのtoken。ここに含まれていない場合はErrorにする。
  var slashtoken = [hook_token];
  if (!slashtoken.some(function(v){ return v === e.parameter.token })) {
    throw new Error("invalid token.");
  }

  var post_message = "";
  var args = e.parameter.text.split(' ');
  var count = args[1];
  var text = args[2];
  
  Logger.log(count);
  Logger.log(text);
  
  var choice_targets = pre_choice(text, e.parameter.user_name, e.parameter.channel_name);
  
  var choiced_member = choice(choice_targets,count);
  post_message +=  "厳正な抽選の結果、「"+choiced_member+"」が選ばれました！"
  Logger.log(post_message);
  postSlack(e.parameter.channel_id, post_message);
  return null;
}

function pre_choice(text, me, channel) {
  var members = [];
  var cases = text.trim();
  switch (cases){
  case "channel":
    //channelに参加しているメンバーを取得;
    var member_array = slackApp.channelsJoin(channel).channel.members;
    for (var i in member_array) {
      var member = slackApp.usersInfo(member_array[i]).user;
      if (member.deleted == 'true' || member.is_bot == 'true') {
        continue;
      }
      members.push(member.name);
    }
    break;
    
  default :
    //空白区切りテキストに含まれるユーザ;
    var member_array = text.split(",");
    var member = "";
    for (var i in member_array) {
      member = member_array[i].trim();
      members.push(member);
    }
    break;
  }
  
  return members;
  //重複を除外する
  //var members_uniq = members.filter(function(elements, index, selfArr) {
  //  return selfArr.indexOf(elements) === index;
  //});

  //return members_uniq;

}

/** 
* randAry
* 配列内からランダムに値を取得する
* @param {array} i_ary 配列
* @return {object} 配列内の値
*/
function choice(i_ary, count){
  
  var return_text = "";
  var i = 0;
  var index = "";
  var keyIndex ="";
  
  //添字を全て取得
  var aryKeys = Object.keys(i_ary);
  
  //対象の添字をランダムに取得
  while(i<count){
    keyIndex = Math.floor(Math.random() * aryKeys.length);
    index = aryKeys[keyIndex];
    // 返却文章を構築
    return_text = return_text +" "+ (i+1) + ":" + i_ary[index];
    // 配列から要素を削除
    aryKeys.splice(keyIndex, 1);
    i++;
  }
  return return_text
}

function postSlack(channel_id, text) {
  var postChannelId = channel_id 
  var option = {
    username: "MultiChoiceBot",
    icon_emoji: ":point_right:",
    link_names: 1,
    unfurl_media: true
  };

  var response = slackApp.postMessage(postChannelId, text, option);
  Logger.log(response);

}