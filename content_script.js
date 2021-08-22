var sendWindow = document.getElementsByClassName('right')[0];
var prevSendBtnNum = 0;

var getRequestPromise = function(url) {
	return new Promise((resolve, reject) => {
		httpRequest.open('GET', url, true);
        httpRequest.send();
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {
                var data = httpRequest.responseText;
                console.log(json);
				resolve(data);
            }
        };
	});
};

// 不要问为什么设置到头像的attribute这么怪，问就是摆烂
function generateOpponentChat(avatarUrl, msg) {
	var opponentChatFrame = document.createElement('div');
	var avatarFrame = document.createElement('a');
	var messageFrame = document.createElement('div');
	var innerMessageFrame = document.createElement('div');
	opponentChatFrame.setAttribute('data-v-3392a41b', '');
	opponentChatFrame.setAttribute('data-v-0eb4e7bc', '');
	opponentChatFrame.setAttribute('class', 'msg-item not-me');
	avatarFrame.setAttribute('data-v-3392a41b', '');
	avatarFrame.setAttribute('href', '//space.bilibili.com/32708506');
	avatarFrame.setAttribute('title', '请问您今天要来点鬼畜吗？');
	avatarFrame.setAttribute('target', '_blank');
	avatarFrame.setAttribute('class', 'avatar');
	avatarFrame.setAttribute('style', `background-image: url('${avatarUrl}');`);
	messageFrame.setAttribute('data-v-3392a41b', '');
	messageFrame.setAttribute('class', 'message');
	innerMessageFrame.setAttribute('data-v-3392a41b', '');
	innerMessageFrame.setAttribute('class', 'message-content not-img');
	innerMessageFrame.innerHTML = msg;
	messageFrame.appendChild(innerMessageFrame);
	opponentChatFrame.appendChild(avatarFrame);
	opponentChatFrame.appendChild(messageFrame);
	return opponentChatFrame;
}

// 这一块原本是想实时存储聊天框url，以便刷新后保留聊天记录，不过遇到了一些问题
// function saveChatRecord(name, messageListWindow) {
// 	console.log(messageListWindow);
// 	chrome.storage.local.set({ [`msgHtml_${name}`]: messageListWindow.innerHTML }, function() {
// 	});
// }

// function loadChatRecord(name, messageListWindow) {
// 	var recordKey = `msgHtml_${name}`;
// 	chrome.storage.local.get(recordKey, function(recObj) {
// 		console.log(recObj);
// 		if (Object.keys(recObj).length > 0) {
// 			messageListWindow.innerHTML = recObj[recordKey];
// 		}
// 	});
// }

function sendBtnClick(act) {
	// 主页面5parents，对话页面3parents
	// 获取头像url
	var fullWindow = this.parentNode.parentNode.parentNode.parentNode.parentNode;
	var activeNameCard = fullWindow.getElementsByClassName('list-item active')[0];
	var name = activeNameCard.getElementsByClassName('name')[0].innerHTML;
	var avatarBox = activeNameCard.getElementsByClassName('avatar')[0];
	var lastWordBox = activeNameCard.getElementsByClassName('name-box')[0].getElementsByClassName('last-word')[0];
	var avatarRawUrl = getComputedStyle(avatarBox, "style").backgroundImage;
	var avatarUrl = new RegExp('http.+?webp').exec(avatarRawUrl)[0];
	// 获取对话消息窗口
	var dialogWindow = this.parentNode.parentNode.parentNode;
	var messageListFrameWindow = dialogWindow.getElementsByClassName('message-list')[0];
	var messageListWindow = messageListFrameWindow.getElementsByClassName('message-list-content')[0];
	// 获取输入对话内容, 请求聊天机器人
	var inputData = dialogWindow.getElementsByClassName('input-box')[0].children[0].innerHTML;
	chrome.runtime.sendMessage({
		act: "sendMsg",
		sendMsg: inputData,
		nickname: name
	}, res => {
		messageListWindow.appendChild(generateOpponentChat(avatarUrl, res));
		messageListFrameWindow.scrollTop += 500; //scroll随便加一个数，反正能滚到底就ok
		lastWordBox.innerHTML = res;
		//saveChatRecord(name, messageListWindow);
	});
}

function messageListLoad(msgListNode) {
	var fullWindow = msgListNode.parentNode.parentNode.parentNode.parentNode;
	var activeNameCard = fullWindow.getElementsByClassName('list-item active')[0];
	var name = activeNameCard.getElementsByClassName('name')[0].innerHTML;
	loadChatRecord(name, msgListNode);
}

new MutationObserver(function(mutations, observer) {
	mutations.forEach(function(val, index, arr) {
		var addNodes = val.addedNodes;
		for (var i = 0; i < addNodes.length; i++) {
			var addNode = addNodes[i];
			// if (addNode.nodeType === 1 && addNode.className === 'message-list') {
			// 	var contentNode = addNode.getElementsByClassName('message-list-content')[0];
			// 	messageListLoad(contentNode);
			// }
			if (addNode.nodeType === 1 && addNode.className === 'dialog') {
				var sendBtn = addNode.getElementsByClassName('send-btn')[0];
				sendBtn.onclick = sendBtnClick;
			}
		}
	});
}).observe(document.body, { childList: true, subtree: true });