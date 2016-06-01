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

var JsSrc='http://icon.xcar.com.cn/wxs/xcarTopic/js/xcarUI.topic.min.js';


var xcarTopicId=1;

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

function xcarTopicEffects(){}
//添加gallery图集效果
xcarTopicEffects.gallery=function(){
	var galleryId='gallery'+(++xcarTopicId);
	var str=[];
	//HTML代码
	str.push('<!-- 爱卡汽车－DW扩展生成－'+galleryId+'效果 begin -->');
	str.push('<!-- data 数据源块-->');
	str.push('<ul id="'+galleryId+'_view_data" style="display: none;">');
	var k=1;
    for(var q=0;q<10;q++){
		  k=k>3?1:k;		  
		  str.push('<li><a><img src="http://icon.xcar.com.cn/zhoulei/code/images/img'+k+'.jpg" width="100%" height="100%" \/></a><\/li>');
		  k++;
	}	
	str.push('	</ul>');
	str.push('<div id="'+galleryId+'_wrap"  style="width:900px; height:576px; overflow:hidden; position:relative; margin:0 auto; z-index:90;">');
  	str.push('<div class="gallery_container" id="'+galleryId+'_container" style="overflow:hidden; position: relative;">')
    str.push('    <div class="gallery_main" id="'+galleryId+'_main">')
    str.push('        <img src="http://icon.xcar.com.cn/zhoulei/code/images/img1.jpg" width="100%" height="100%">')
    str.push('    <\/div>')
	str.push('<\/div>')
    str.push('<a href="javascript:void(0)" id="'+galleryId+'_big_left" class="gallery_big_arr_left" onFocus="this.blur()">')
    str.push('	<i><\/i>')
    str.push('<\/a>')
    str.push('<a href="javascript:void(0)" id="'+galleryId+'_big_right" class="gallery_big_arr_right" onFocus="this.blur()">')
    str.push('	<i><\/i>')
    str.push('<\/a>') 	
    
    str.push('<div class="gallery_status" id="'+galleryId+'_status">')
    str.push('	<div class="gallery_status_bg"></div>')
    str.push('    <div class="gallery_bar"><i id="'+galleryId+'_bar_arr"></i></div><!-- 向上指 i.class="gallery_bar_up" -->')
    str.push('    <div class="gallery_sml"> ')
    str.push('    	  <a class="gallery_sml_left" href="javascript:void(0);" id="'+galleryId+'_sml_left"></a>')
    str.push('          <div class="gallery_nav_view" id="'+galleryId+'_nav_view">')
    str.push('              <ul class="gallery_scroll_panel" id="'+galleryId+'_scroll_panel">');
	var j=1;
    for(var i=0;i<10;i++){
		  j=j>3?1:j;		  
		  str.push('<li><a><img src="http://icon.xcar.com.cn/zhoulei/code/images/img'+j+'.jpg" width="100%" height="100%" \/></a><\/li>');
		  j++;
	}
    str.push('             <\/ul>')
    str.push('         <\/div>     ')         
    str.push('         <a class="gallery_sml_right" href="javascript:void(0);" id="'+galleryId+'_sml_right"><\/a>')              
    str.push('  <\/div>')
    str.push('<\/div>')
    str.push('<\/div>')
    str.push('<script>\n');
    str.push('xcarUI.picGalleryUID({galleryUID:"'+galleryId+'",viewEffect:0,loop:true,time:200,defaultIdx:2})\n');
    str.push('<\/script>');
    str.push('<!-- 爱卡汽车－DW扩展生成－'+galleryId+'效果 end -->');

	return str.join('');		
}
xcarTopicEffects.picScroll=function(){
	var picScrollId='picScroll'+(++xcarTopicId);
	
	var str=[];
	//HTML代码
	str.push('<!-- 爱卡汽车－DW扩展生成－'+picScrollId+'效果 begin -->');
	str.push('<div class="scrollPic4">');
	str.push('<a class="prebtn" href="javascript:void(0)" id="'+picScrollId+'_left"><\/a>');
	str.push('<div id="'+picScrollId+'" class="scrollDiv4">');
	str.push('<div><ul>');
	var j=1;
		for(var i=0;i<10;i++){
			  j=j>3?1:j;		  
			  str.push('<li><a><img src="http://icon.xcar.com.cn/zhoulei/code/images/img'+j+'.jpg" width="169" height="127" \/></a><\/li>');
			  j++;
		}
	str.push('<\/ul>');
	str.push('<ul><\/ul><\/div>');
	str.push('<\/div>');
	str.push('<a class="nexbtn" href="javascript:void(0)" id="'+picScrollId+'_right"><\/a>');
	str.push('<\/div>');
	str.push('<script>\n');
    str.push('var picscroll=new xcarUI.picScroll({id:"'+picScrollId+'",\n autoScroll:false, \n delay:2000,\n pageWidth:187,\n duration:400,\n leftBtn:"'+picScrollId+'_left",\n rightBtn:"'+picScrollId+'_right"});\n');
    str.push('<\/script>');
    str.push('<!-- 爱卡汽车－DW扩展生成－'+picScrollId+'效果 end -->');

	return str.join('');	
}

xcarTopicEffects.slopeScroll=function(){
	var slopeScrollId='slopeScrollId'+(++xcarTopicId);
	
	var str=[];
	//HTML代码
	str.push('<!-- 爱卡汽车－DW扩展生成－'+slopeScrollId+'效果 begin -->');
	
	//data
	str.push('<ul id="'+slopeScrollId+'_view_data" style="display: none;">');
		var j=1;
	for(var i=0;i<12;i++){
		j=j>3?1:j;		  
		str.push('<li style="display:block;"><a href="#"><img src="http://icon.xcar.com.cn/zhoulei/code/images/img1.jpg" width="100%" height="100%"></a><\/li>');
		j++;
	}
	str.push('</ul>');

	
	str.push('<div class="pic_wrap" style=" margin: 0 auto;">');
    str.push('<div class="pic_container" id="'+slopeScrollId+'_container" style="overflow:hidden; position: relative;">');
    str.push('    <div class="pic_main" id="'+slopeScrollId+'_main">');
    str.push('        <img src="http://icon.xcar.com.cn/zhoulei/code/images/img1.jpg" width="100%" height="100%">');
    str.push('    </div>');
    str.push('</div>');
    str.push('<a href="javascript:void(0)" class="pic_left" id="'+slopeScrollId+'_left"></a>');
    str.push('<a href="javascript:void(0)" class="pic_right" id="'+slopeScrollId+'_right"></a>');
	str.push('</div>');

	str.push('<script>\n');
    str.push('var '+slopeScrollId+'=new xcarUI.picShow({\n');
	str.push('container:xcarUI.$("'+slopeScrollId+'_container"),\n');
	str.push('mainView:xcarUI.$("'+slopeScrollId+'_main"),\n');
	str.push('items:xcarUI.$$("li",xcarUI.$("'+slopeScrollId+'_view_data")),\n');
	str.push('itemHtmlFn:function(idx){return this.items[idx].innerHTML;},\n');
	str.push('animTime:300,\n');
	str.push('effect:0,	\n');
	str.push('loop:true});\n');
	str.push(''+slopeScrollId+'.goTo(0);\n');
	str.push('var leftBtn=xcarUI.$("'+slopeScrollId+'_left");\n');
	str.push('var rightBtn=xcarUI.$("'+slopeScrollId+'_right");\n');
	str.push('xcarUI.addEvent(leftBtn,"click",function(){'+slopeScrollId+'.setEffect(1);'+slopeScrollId+'.prev();})\n');
	str.push('xcarUI.addEvent(rightBtn,"click",function(){'+slopeScrollId+'.setEffect(2);'+slopeScrollId+'.next();})\n');
    str.push('<\/script>');
    str.push('<!-- 爱卡汽车－DW扩展生成－'+slopeScrollId+'效果 end -->');

	return str.join('');	
}

xcarTopicEffects.imageSlider=function(){
	var imageSliderId='imageSliderId'+(++xcarTopicId);
	
	var str=[];
	//HTML代码
	str.push('<!-- 爱卡汽车－DW扩展生成－'+imageSliderId+'效果 begin -->');
	

	str.push('<div id="'+imageSliderId+'" class="imageMenu">');
    str.push('<ul>');
    str.push('    <li class="banner01"><a target="_blank" href="http://xcar.com.cn" style="width: 248px;">banner01<\/a><\/li>');
    str.push('    <li class="banner02"><a target="_blank" href="http://xcar.com.cn" style="width: 248px;">banner02<\/a><\/li>');
    str.push('    <li class="banner03"><a target="_blank" href="http://xcar.com.cn" style="width: 248px;">banner03<\/a><\/li>');
    str.push('    <li class="banner04"><a target="_blank" href="http://xcar.com.cn" style="width: 253px;">banner04<\/a><\/li>');
    str.push('<\/ul>');
	str.push('<\/div>');


	str.push('<script>\n');
	
    str.push(' new xcarUI.imageSlider({\n');
	str.push('	viewport:xcarUI.$("'+imageSliderId+'"),\n');
	str.push('	elements:xcarUI.$$("a",xcarUI.$("'+imageSliderId+'")),\n');
	str.push('	openWidth:700,\n');
	str.push('	onOpen:function(idx,obj){window.open(obj.href);}\n');
	str.push('});\n');

    str.push('<\/script>');
    str.push('<!-- 爱卡汽车－DW扩展生成－'+imageSliderId+'效果 end -->');

	return str.join('');		
}

