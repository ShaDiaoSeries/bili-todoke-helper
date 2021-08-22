window.onload = function () {
    chrome.tabs.create({'url': chrome.extension.getURL('options.html')}, function (tab) {
    });
}