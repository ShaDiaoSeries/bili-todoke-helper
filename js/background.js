// 请求拦截有点复杂，目前代码有问题，暂未启用，如果有人愿意用的话我就搞一下，或者你们可以提个PR
// chrome.webRequest.onBeforeRequest.addListener(
//     function(details) {
//         //return {redirectUrl: chrome.extension.getURL("returns.js")}; //returns.js是你要替换的js脚本
//         console.log('have a cancel!');
//         return { cancel: true }
//     },
//     {
//         urls: ["https://api.vc.bilibili.com/web_im/v1/web_im/send_msg"]
//     },
//     ["blocking"]
// );

var httpRequest =new XMLHttpRequest();
var chatbotUrl = 'https://api.qingyunke.com/api.php?key=free&appid=0&msg=';

var specialReplyConfig = {};

chrome.storage.local.get('chatConfigList', function(specialChatData) {
    if (!!specialChatData && !!specialChatData.chatConfigList) {
        var chatConfigList = specialChatData.chatConfigList;
        chatConfigList.forEach(chatConfigObj => {
            var nickname = chatConfigObj.nickname;
            var sendPattern = chatConfigObj.sendPattern;
            var replyContent = chatConfigObj.replyContent;
            if (!specialReplyConfig.hasOwnProperty(nickname)) {
                specialReplyConfig[nickname] = [];
            }
            specialReplyConfig[nickname].push({ sendPattern: sendPattern, replyContent: replyContent });
        });
    }
});

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    var action = req.action;
    var sendMsg = req.sendMsg;
    var nickname = req.nickname;
    // 聊天输入框会附带一个不可见字符，但我这边写\u2000-\uffff都没过滤掉，就先用下面这条过滤规则吧
    var rule = /([\x21-\x7e\u3000-\uffff]+)/
    if (!sendMsg) {
        sendResponse('');
    } else {
        var replyConfigList = specialReplyConfig[nickname];
        console.log(JSON.stringify(replyConfigList));
        var replyConfigObj = replyConfigList?.find(o => {
            var str1 = o.sendPattern.trim().match(rule)[1];
            var str2 = sendMsg.trim().match(rule)[1];
            return str1 == str2; 
        });
        console.log(JSON.stringify(replyConfigObj));
        if (!!replyConfigObj) {
            var replyList = replyConfigObj.replyContent.split(';');
		    var chosenIndex = Math.floor(Math.random() * replyList.length);
            setTimeout(() => {
                sendResponse(replyList[chosenIndex]);
            }, 2000);
        } else {
            httpRequest.open('GET', chatbotUrl + sendMsg, true);
            httpRequest.send();
            httpRequest.onreadystatechange = function () {
                if (httpRequest.readyState == 4 && httpRequest.status == 200) {
                    var data = httpRequest.responseText;
                    // 目前使用的聊天机器人会自称“菲菲”，这边会将菲菲替换成聊天对象昵称前两个字
                    var respContent = JSON.parse(data).content;
                    var nicknameHead = nickname.length >= 2 ? nickname.substr(0, 2) : nickname;
                    sendResponse(respContent.replace('菲菲', nicknameHead));
                }
            };
        }
    }
    return true;
});