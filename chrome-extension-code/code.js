var data = chrome.extension.getBackgroundPage()._src;
var codePort=document.getElementById('codePort');
data=encodeURIComponent(data);
var _src="http://chart.apis.google.com/chart?cht=qr&chs=280x280&chl=$url$&choe=UTF-8&chld=L|4";
codePort.src=_src.replace('$url$',data);