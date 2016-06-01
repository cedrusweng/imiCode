var _src
function checkForValidUrl(tabId, changeInfo, tab) {
	if(tab.url){
		_src=tab.url;
		chrome.pageAction.show(tabId);
	}
};

chrome.tabs.onUpdated.addListener(checkForValidUrl);
