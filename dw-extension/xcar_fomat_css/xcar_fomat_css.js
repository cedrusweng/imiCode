var xcarTopicUtil=(function(){
	
	function _getDom(){
		return dw.getDocumentDOM();
	}
	
	function _getContent(){
		var dom=_getDom();
		return dom.source.getText()||'';	
	}
	
	function _getSelectionRange() {
		var dom=_getDom();
		var selection = dom.source.getSelection();
		return {
			start: selection[0],
			end: selection[1]
		};
	}

	function _getFilePath(){
		var dom=_getDom();
		return dom.URL;
	}
	
	
	return {
		getDom:_getDom,
		getContent:_getContent,
		getSelectionRange:_getSelectionRange,
		getFilePath:_getFilePath
	}	
})();

var xcarTopic=(function(util){
	function _insertJavascript(dom,src){
		var assetList=[];		
		var obj = {};
		obj.srcURL =  src;
		obj.refType = "javascript";
		obj.destURL = '';
		obj.useDefaultFolder = false;
		obj.documentRelative = false;
		assetList.push(obj);
		dom.copyAssets(assetList);
	}

	function _insertCss(dom,name){
		var cssSrc='xcarTopic/css/'+name+'.css';
		var assetList=[];
		var assetInfo=new AssetInfo(cssSrc,'css/'+name+'.css','link');
		assetList.push(assetInfo);
		dom.copyAssets(assetList);
	}
	
	function _insertHtml(name){

		var dom=util.getDom();
		var ret;

		//头部插入css
		_insertCss(dom,name);

		//头部插入js
		_insertJavascript(dom,JsSrc);

		//光标位置插入html
		ret=(xcarTopicEffects[name]&&xcarTopicEffects[name]());		
		dom.insertHTML(ret);
	}
	

	return {
		insertHtml:_insertHtml	
	}
	
})(xcarTopicUtil);

function fomatSortOrderCSS(css){
	var cssFomat=new xcarCssStyle();
	var res=cssFomat.detectInString(css);
	if(!res)return css;
	else return res;
}




	