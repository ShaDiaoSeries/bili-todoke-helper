function textDel(ev){
    this.parentNode.parentNode.remove();
}
var replaceRules = 0;
function addChatConfigRow(thisNode, specialChatData) {
    var nickname = specialChatData?.nickname ?? "";
    var sendPattern = specialChatData?.sendPattern ?? "";
    var replyContent = specialChatData?.replyContent ?? "";
    var configItem = document.getElementsByClassName('config-form-item')[0];
    var configItemClone = configItem.cloneNode(true);
    configItemClone.removeAttribute('hidden');
    configItemClone.getElementsByClassName('chat-nickname')[0].value = nickname;
    configItemClone.getElementsByClassName('send-pattern')[0].value = sendPattern;
    configItemClone.getElementsByClassName('reply-content')[0].value = replyContent;
    var delBtn = configItemClone.getElementsByClassName('row-delete-btn')[0];
    delBtn.addEventListener('click', textDel);
    document.getElementById('config-form').appendChild(configItemClone);
}

document.getElementById('add_special_reply_rule_btn').onclick = function(curNode) {
    layui.use('form', function() {
        var form = layui.form;
        addChatConfigRow(curNode);
        form.render();
    });
};

document.getElementById('save_btn').onclick = function() {
    var specialChatDataNodes = document.getElementsByClassName('config-form-item');
    var chatConfigList = [];
    for (var i = 0; i < specialChatDataNodes.length; i++) {
        var specialChatDataNode = specialChatDataNodes[i];
        var nickname = specialChatDataNode.getElementsByClassName('chat-nickname')[0].value;
        var sendPattern = specialChatDataNode.getElementsByClassName('send-pattern')[0].value;
        var replyContent = specialChatDataNode.getElementsByClassName('reply-content')[0].value;
        if (!!nickname && !!sendPattern && !!replyContent) {
            chatConfigList.push({nickname: nickname, sendPattern: sendPattern, replyContent: replyContent});
        }
    }
	chrome.storage.local.set({ 'chatConfigList': chatConfigList }, function() {
		alert('保存成功！');
	});
};

window.onload = function() {
    chrome.storage.local.get('chatConfigList', function(specialChatData) {
        if (!!specialChatData && !!specialChatData.chatConfigList) {
            layui.use('form', function() {
                var form = layui.form;
                var replaceList = specialChatData.chatConfigList;
                replaceList.forEach(replaceObj => {
                    addChatConfigRow(null, replaceObj);
                });
                form.render();
            });
        }
	});
}