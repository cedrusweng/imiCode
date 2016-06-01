
//---------------   GLOBAL VARIABLES   ---------------


//�˵����Ӳ˵�
var MENU_ID='extension-menu';
var MENU_SUB_ID='extension-sub-menu';

//�˵����Ӧ���ø�����
var MENU_CSS_ATTR='data-css';
var MENU_HTML_ATTR='data-html';
var MENU_JS_ATTR='data-js';
var MENU_SUB_OPTION='data-sub';
var MENU_ALIAS='data-alias';

//id��ʶ��
var EFFECT_IDENT='@effect_id@';



//Զ�����Ŀ¼
var EFFECT_REMOTE_FOLDER= 'http://10.19.96.190/dw-extension/';
var REMOTE_OPTION_MENU=EFFECT_REMOTE_FOLDER+'menu.htm';
var REMOTE_CSS_FOLDER=EFFECT_REMOTE_FOLDER+'css/';
var REMOTE_HTML_FOLDER=EFFECT_REMOTE_FOLDER+'html/';
var REMOTE_THUMB_FOLDER=EFFECT_REMOTE_FOLDER+'thumb/';

//����Ŀ¼
var EFFECT_LOC_FOLDER= dw.getConfigurationPath()+'/xcar/';
var EFFECT_OPTION_MENU=EFFECT_LOC_FOLDER+'menu.htm';
var EFFECT_CSS_FOLDER=EFFECT_LOC_FOLDER+'css/';
var EFFECT_HTML_FOLDER=EFFECT_LOC_FOLDER+'html/';
var EFFECT_THUMB_FOLDER=EFFECT_LOC_FOLDER+'thumb/';





//�жϱ����ļ��Ƿ����
function localFileIsExist(path){
	if(DWfile.exists(path)){
		return true;	
	}	
	return false;
}

//Զ���ļ�����������Ŀ¼
function copyRemoteFile(remoteUrl,localPath){
	var httpReply=MMHttp.getFile(remoteUrl,false);//��ȡԶ���ļ�
	if(httpReply.statusCode===200){
		if(DWfile.copy(httpReply.data,localPath)){
			return true;	
		}
	}	
	return false;
}

//����Ŀ¼�б���Դ��Ϣ
function updateLocalAssets(){
	document.theForm.updataInfo.value='�����С�����'
	var _slice=Array.prototype.slice;
	//��ȡ�˵�
	if(updateMenu()){	
		//����menu submenu��ȡhtml��css��Դ�ļ�
		var menu=getMenu();
		var subMenu=getSubMenuList();
		var menu=_slice.call(menu).concat(_slice.call(subMenu));
		if(menu.length>0){			
			for(var i=0,len=menu.length;i<len;i++){
				var menuObj=menu[i];				
				var alias=menuObj[MENU_ALIAS];//����			
				getAssets(alias)
			}
			document.theForm.updataInfo.value='�ٴλ�ȡ';
			initializeUI();
		}
		return;
	}
	document.theForm.updataInfo.value='����ʧ��';
}

//����Ŀ¼�б�
function updateMenu(){
	if(copyRemoteFile(REMOTE_OPTION_MENU,EFFECT_OPTION_MENU)){
		return true;	
	}	
	return false;
}

//��ȡĿ¼�б�
function getMenu(){
	var menuArr;	
	if(localFileIsExist(EFFECT_OPTION_MENU)){
		var dom=dreamweaver.getDocumentDOM(EFFECT_OPTION_MENU);
		menuArr=dom.getElementById(MENU_ID).getElementsByTagName('li');			
	}else{
		if(copyRemoteFile(REMOTE_OPTION_MENU,EFFECT_OPTION_MENU)){
			getMenu();	
		}	
	}
	return menuArr;	
}


//��ȡ��Ŀ¼�б�
function getSubMenu(idx){
	var res='';	
	res=getSubMenuList()[idx]
	return res;	
}

//��ȡ��Ŀ¼�б�
function getSubMenuList(){
	var res='';	
	if(localFileIsExist(EFFECT_OPTION_MENU)){
		var dom=dreamweaver.getDocumentDOM(EFFECT_OPTION_MENU);
		res=dom.getElementById(MENU_SUB_ID).getElementsByTagName('li');			
	}
	return res;	
}

//��ȡ��Ӧ��Դ
function getAssets(name){
	getHTMLAssets(name);
	getCSSAssets(name);
	getImgAssets(name);
}
//��ȡhtml��Դ
function getHTMLAssets(name){
	var remotePath=REMOTE_HTML_FOLDER+name+'.htm';
	var localPath=EFFECT_HTML_FOLDER+name+'.htm';
	copyRemoteFile(remotePath,localPath)
}


//��ȡcss��Դ
function getCSSAssets(name){
	var remotePath=REMOTE_CSS_FOLDER+name+'.css';
	var localPath=EFFECT_CSS_FOLDER+name+'.css';	
	if(copyRemoteFile(remotePath,localPath)){
		return true;
	}
	return false;
}


//��ȡԤ��ͼ
function getImgAssets(name){
	var remotePath=REMOTE_THUMB_FOLDER+name+'.jpg';
	var localPath=EFFECT_THUMB_FOLDER+name+'.jpg';	
	if(copyRemoteFile(remotePath,localPath)){
		return true;
	}
	return false;
}


//��ȡhtml����
function getHTML(name){
    var uniqueId=dwscripts.getUniqueId("xcar_effect_");
	var remotePath=REMOTE_HTML_FOLDER+name+'.htm';
	var localPath=EFFECT_HTML_FOLDER+name+'.htm';
	var html='';	
	if(localFileIsExist(localPath)){
		var content=DWfile.read(localPath);
		var reg=new RegExp(EFFECT_IDENT,'g');
		html=content.replace(reg,uniqueId);
	}else{
		if(copyRemoteFile(remotePath,localPath)){
			getHTML(name);	
		}
	}
	return html
}

//��ȡcss�ļ�
function getCSS(name){	
	var remotePath=REMOTE_CSS_FOLDER+name+'.css';
	var localPath=EFFECT_CSS_FOLDER+name+'.css';	
	if(localFileIsExist(localPath)){
		var dom=dw.getDocumentDOM();
		var assetList=[];
		var assetInfo=new AssetInfo(localPath,'css/'+name+'.css','link',true,true);
		assetList.push(assetInfo);
		dom.copyAssets(assetList);
	}
}

//��ȡjs�ļ�
function getJS(jsSrc){
	var dom=dw.getDocumentDOM();
	var js=jsSrc;
	var assetList=[];
	var assetInfo=new AssetInfo(js,'','javascript',false,false);
	assetList.push(assetInfo);
	dom.copyAssets(assetList);
}









function isDOMRequired() {
	return false;
}

function commandButtons()
{
   return new Array("PutButtonsOnBottom", "OkButton defaultButton", MM.BTN_OK, "if (setEffectStr()) window.close()",
                    "CancelButton", MM.BTN_Cancel, "window.close()" );
}




function setEffectStr() {
  var retStr;
  var effectName=document.theForm.EffectName;
  var subEffectName=document.theForm.SubEffectName;
  var optIndex=effectName.selectedIndex;
  var optText=effectName.options[optIndex].innerHTML;
  var optAlias =effectName.options[optIndex][MENU_ALIAS];
  
  var optJS=effectName.options[optIndex][MENU_JS_ATTR];
  
  var optCSS=effectName.options[optIndex][MENU_CSS_ATTR];
  var optSub=effectName.options[optIndex][MENU_SUB_OPTION];
  //������Ӳ˵�
  if(optSub!=='undefined'){
	  var suboptIndex=subEffectName.selectedIndex;
	  optHTML=subEffectName.options[suboptIndex][MENU_ALIAS];
	  optCSS=subEffectName.options[suboptIndex][MENU_CSS_ATTR];
	  optAlias=subEffectName.options[suboptIndex][MENU_ALIAS];
  }
  
  //����js
  if(optJS){
	  optJS=optJS.split(',');
	  for(var ijs=0,lenjs=optJS.length;ijs<lenjs;ijs++){
  	  	getJS(optJS[ijs]);
	  }
  }

  if(optAlias){
	  getCSS(optAlias)
	  returnTag = '<!-- Ч����'+optText+' begin -->\n'+getHTML(optAlias)+'\n<!-- Ч����'+optText+' end -->\n';
  }
  return true;
}





function createEffectStr(){
	return returnTag;
}


//��ʼ���˵�
function initMenu(){	
	var retStr,optStr='';
	try{
		retStr=getMenu();
		for(var i=0,len=retStr.length;i<len;i++){
			optStr+="<option "+MENU_ALIAS+"='"+retStr[i][MENU_ALIAS]+"' "+MENU_JS_ATTR+"='"+retStr[i][MENU_JS_ATTR]+"' "+MENU_CSS_ATTR+"='"+retStr[i][MENU_CSS_ATTR]+"' "+MENU_SUB_OPTION+"='"+retStr[i][MENU_SUB_OPTION]+"'>"+retStr[i].innerHTML+"</option>";
			document.theForm.EffectName.innerHTML=optStr;
		}
		
		var selectedOption=document.theForm.EffectName.options[0]
		selectedOption.selected=true;
		effectThumbChange(selectedOption[MENU_ALIAS]);
		
		createSubMenu(0);
	}catch(ex){
		updateLocalAssets();
	}
}

//Ԥ��ͼ���Ӳ˵�
var EffefctImg=document.getElementById('EffefctImg');
var subBox=document.getElementById('subBox');


//�˵��л��¼�
function effectChange(){
	var optIndex=document.theForm.EffectName.selectedIndex;
	
	var selectedOption=document.theForm.EffectName.options[optIndex];
	if(selectedOption[MENU_SUB_OPTION]==='undefined'){
		effectThumbChange(selectedOption[MENU_ALIAS]);
	}
	createSubMenu(optIndex);
}


//Ԥ��ͼ�仯
function effectThumbChange(name){
	var imgSrc='../xcar/thumb/'+name+'.jpg';
	if(name==undefined){
		EffefctImg.innerHTML='';
		return;
	}
	EffefctImg.innerHTML='<img width="130" height="120" src="'+imgSrc+'" />';
}


//�����Ӳ˵�
function createSubMenu(idx){
	var subMenu=document.theForm.SubEffectName;
	var subMenuOpts=[];
	var parentMenu=document.theForm.EffectName.options[idx];
	parentMenu.selected=true;

	//������
	if(parentMenu[MENU_SUB_OPTION]==='undefined'){
		subMenu.innerHTML='<option>��</option>';
		subMenu.childNodes[0].selected=true;
		return;
	}else{
		subBox.style.display='block';
		
		var subMenuArr=parentMenu[MENU_SUB_OPTION].split(',');
		
		for(var i=0,len=subMenuArr.length;i<len;i++){
			var subMenuObj=getSubMenu(subMenuArr[i]);
			subMenuOpts.push('<option '+MENU_ALIAS+'="'+subMenuObj[MENU_ALIAS]+'" '+MENU_CSS_ATTR+'="'+subMenuObj[MENU_CSS_ATTR]+'">'+(subMenuObj&&subMenuObj.innerHTML)+'</option>');	
		}
		subMenu.innerHTML=subMenuOpts.join('\n');
		subMenu.options[0].selected=true;
		
		effectThumbChange(subMenu.childNodes[0][MENU_ALIAS])
	}		
}




