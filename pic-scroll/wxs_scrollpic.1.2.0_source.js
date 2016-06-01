// JavaScript Document
/*************版本1.2.0*********************/
//
//
//接口
//init 
//参数 
//var options={ id:DOMId,
//   pagespeed:滚动间隔,
//   pageWidth:每次滚动宽度,
//   scrollspeed:滚动速度,
//   autoscroll:是否自动滚动
//}
//onlclick
//onrclick


/*使用示例：
  var picScroll=new scrollPic();
  var options={
		id:"picscroll",
		pagespeed:3000,//滚动间隔
		pageWidth:200,//每次滚动宽度
		scrollspeed:10,//滚动速度
		autoscroll:false//是否自动滚动 默认为true 
  }  
*/



var topicTools=(function(){
	//扩展
	var extend=function(targetObj,sourceObj){
		if(sourceObj&&typeof sourceObj==="object"){
			for(var name in sourceObj){
				targetObj[name]=sourceObj[name];				
			}	
		}
		return targetObj;
	}
	//Dom获取id
	var $_id=function(id){
		return document.getElementById(id)||id;
	}
	//Dom获取tag
	var $_tag=function(tag,context){
		var tag=tag||"*";
		var context=context||document;
		return context.getElementsByTagName(tag);
	}
	
	var $_createEl=function(tag){
		return document.createElement(tag);	
	}
	
	//Dom设置innerHTML
	var $_setHTML=function(o,html){
		o.innerHTML=html;	
	}
	
	
	
	//computeStyle
	var $_computeStyle=function(o,attr,isNum){
		
		var resValue;
		
		if(o.currentStyle){
			resValue=o.currentStyle[attr]||0;	
		}else if(document.defaultView.getComputedStyle){
			resValue=document.defaultView.getComputedStyle(o,false)[attr]||0;	
		}
		if(resValue==="auto"){
			resValue=0;	
		}	
		
		return isNum?parseInt(resValue):resValue;
	}
		//setStyle
	var $_setStyle=function(o,attr,val,unite){
		var unite=unite||"";
		o.style[attr]=val+unite;	
	}
	
	
	var $_getNaturalSize=function(o){
		var res={};
		if(o.offsetWidth===0){
			var tmp=o,dis="",oldCss={};
			
			while(dis!=="none"){
				tmp=tmp.parentNode;
				dis=$_computeStyle(tmp,"display");
				if(tmp===document.body){
					return {
						width:0,
						height:0
					}	
				}
			}
			oldCss["display"]=$_computeStyle(tmp,"display");
			oldCss["position"]=$_computeStyle(tmp,"position");
			oldCss["visibility"]=$_computeStyle(tmp,"visibility");
			$_setStyle(tmp,"display","block");
			$_setStyle(tmp,"position","absolute");
			$_setStyle(tmp,"visibility","hidden");			
			res={
				width:o.clientWidth+$_computeStyle(o,"marginLeft",true)+$_computeStyle(o,"marginRight",true),
				height:o.clientHeight+$_computeStyle(o,"marginTop",true)+$_computeStyle(o,"marginBottom",true)
			}
			$_setStyle(tmp,"display",oldCss["display"]);
			$_setStyle(tmp,"position",oldCss["position"]);
			$_setStyle(tmp,"visibility",oldCss["visibility"]);
		}else{
			res={
				width:o.clientWidth+$_computeStyle(o,"marginLeft",true)+$_computeStyle(o,"marginRight",true),
				height:o.clientHeight+$_computeStyle(o,"marginTop",true)+$_computeStyle(o,"marginBottom",true)
			}	
			
		}		
		return res; 
	}
	
	

	
	
	
	
	
	
	
	//动画
	var $_animate=function(e,attr,distance,callBackFn,time){
		if(typeof e==="string")e=document.getElementById(e);
		if(!time)time=800;
		if(!distance)distance=800;
		var originalVal=$_computeStyle(e,attr,true);		
		var start=(new Date()).getTime();
		var step=function(){
			var elapsed=(new Date())-start;
			var fraction=elapsed/time;					
			if(fraction<1){						
				var diff=originalVal+fraction*distance;
				$_setStyle(e,attr,diff,"px");
				setTimeout(step,Math.min(25,time-elapsed));
			}else{
				$_setStyle(e,attr,originalVal+distance,"px");
				if(callBackFn)callBackFn(e);
			}	
		}			
		step();						
	}	
	
	var $_addEvent=function(o,ev,fn){
		if(o.addEventListener){
			$_addEvent=function(o,ev,fn){
				o.addEventListener(ev,fn,false);
			}
		}else if(o.attachEvent){
			$_addEvent=function(o,ev,fn){
				o.attachEvent("on"+ev,fn);	
			}
		}else{
			$_addEvent=function(o,ev,fn){
				o["on"+ev]=fn;
			}
		}
		$_addEvent(o,ev,fn);
	}
	
	
	
	//获取整数倍宽度
	var $_getIntTimes=function(inNum,stdNum){	
		if(inNum<stdNum)return stdNum;
		return Math.floor(inNum/stdNum)*stdNum;				
	}
	

	var $_debug=function(text){
		////console.log(text);
		//alert(text)
	}
	return {
		debug:$_debug,
		extend:extend,
		id:$_id,
		tag:$_tag,
		createEl:$_createEl,
		setHTML:$_setHTML,
		computeStyle:$_computeStyle,
		getNaturalSize:$_getNaturalSize,
		setStyle:$_setStyle,
		animate:$_animate,
		addEvent:$_addEvent,
		getIntTimes:$_getIntTimes,
		
	}
})()





ScrollPic.defaultOptions={
	id:"picscroll",
	pagespeed:3000,//滚动间隔
	pageWidth:142,//每次滚动宽度
	scrollspeed:10,//滚动速度
	autoscroll:true,//是否自动滚动 默认为true
	leftBtn:null,
	rightBtn:null,
	itemTag:"li"
}

function ScrollPic(){
	this.opts=topicTools.extend({},ScrollPic.defaultOptions);	
	this._interval=null;	
}
ScrollPic.prototype={
	constructor:ScrollPic,
	init:function(options){
			var that=this,opts,lis,len,stdWidth,wrapWidth;	
			that.opts=topicTools.extend(that.opts,options);			
			opts=that.opts;			
			opts.$=topicTools.id(opts.id);
			lis=topicTools.tag(opts.itemTag,opts.$);
			len=lis.length;
			stdWidth=topicTools.getNaturalSize(lis[0]).width;
			if(wrapWidth<stdWidth*len){
				return;	
			}
			wrapWidth=topicTools.getNaturalSize(opts.$).width;
			
			//console.log(this.opts)
			opts.$leftBtn=topicTools.id(opts.leftBtn);
			opts.$rightBtn=topicTools.id(opts.rightBtn);			
			opts.pageWidth=topicTools.getIntTimes(opts.pageWidth,stdWidth);
			
			if(opts.pageWidth>stdWidth*len){
				opts.pageWidth=stdWidth*len;
			}
			
			
			
			//topicTools.debug(opts.leftBtn.$)
			if(opts.autoscroll){
				topicTools.addEvent(opts.$,"mouseover",function(){that.stop()})
				topicTools.addEvent(opts.$,"mouseout",function(){that.play()})
				if(opts.$leftBtn){	
					topicTools.addEvent(opts.$leftBtn,"mouseover",function(){that.stop()})
					topicTools.addEvent(opts.$leftBtn,"mouseout",function(){	that.play()})
				}
				if(opts.$rightBtn){		
					topicTools.addEvent(opts.$rightBtn,"mouseover",function(){that.stop()})
					topicTools.addEvent(opts.$rightBtn,"mouseout",function(){that.play()})
				}
			}
			if(opts.$leftBtn){				
				topicTools.addEvent(opts.$leftBtn,"click",function(){					
					that.left();	
				})
			}
			if(opts.$rightBtn){				
				topicTools.addEvent(opts.$rightBtn,"click",function(){
					that.right();
				})
			}
			
			this.setup(opts.$,len,stdWidth);
			if(opts.autoscroll){
				this.play()
			}
	},
	setup:function(wrap,len,stdWidth){					
		var ul=topicTools.tag("ul",wrap)[0];	
		var div=topicTools.createEl("div");
		var divWrap=topicTools.createEl("div");
		var that=this;		
			
			
		that.scroll={}
		that.scroll.$=div;
		that.scroll.width=len*stdWidth;
			
		div.appendChild(ul.cloneNode(true));
		div.appendChild(ul);
		div.appendChild(ul.cloneNode(true));
			
		topicTools.setStyle(divWrap,"position","relative");	
		topicTools.setStyle(divWrap,"overflow","hidden");
		topicTools.setStyle(divWrap,"width","100%");
		topicTools.setStyle(divWrap,"height","100%");
			
		topicTools.setStyle(div,"width",3*len*stdWidth,"px");
		topicTools.setStyle(div,"position","absolute");
		topicTools.setStyle(div,"left",-len*stdWidth,"px");
			
		topicTools.setHTML(wrap,"");
		divWrap.appendChild(div);
		wrap.appendChild(divWrap);			
	},
	stop:function(){				
		var that=this;
		that._interval&&clearInterval(that._interval)			
	},		
	play:function(){			
		var that=this,opts=that.opts;
		//console.log(this.opts)
		that.stop();
		that._interval=setInterval(function(){					
			that.move("left",opts.scrollspeed*20,opts.pageWidth);
		},opts.pagespeed);
			
	},
	move:function(direct,time){
		var that=this,opts=that.opts;
		that._preTestAndResetLeftVal(direct);
		topicTools.animate(that.scroll.$,"left",(direct==="left"?-1:1)*opts.pageWidth,function(){
			that._resetLeftVal();
		},time);	
	},
	_preTestAndResetLeftVal:function(direct){
			var that=this,opts=that.opts,curLeft,preTestVal,preLeftVal;
			curLeft=topicTools.computeStyle(that.scroll.$,"left",true);
			preTestVal=curLeft+(direct==="left"?-1:1)*opts.pageWidth;			
			that._resetLeftVal(preTestVal);	
	},
	_resetLeftVal:function(curLeft){
		var that=this,opts=that.opts,curLeft,resetLeftVal;
		curLeft=Math.abs(curLeft||topicTools.computeStyle(that.scroll.$,"left",true));			
		if(curLeft>that.scroll.width*2-opts.pageWidth){				
			resetLeftVal=that.scroll.width-opts.pageWidth;
		}else if(curLeft<that.scroll.width){
			resetLeftVal=that.scroll.width*2;
		}else if(curLeft%opts.pageWidth!==0){
			resetLeftVal=Math.floor(curLeft/opts.pageWidth)*opts.pageWidth;
		}else{
			return;
		}			
		topicTools.setStyle(that.scroll.$,"left",-resetLeftVal,"px");
	},
	left:function(){
		var that=this,opts=that.opts;
		
		that.move("left",opts.scrollspeed*10);			
	},
	right:function(){
		var that=this,opts=that.opts;
		that.move("right",opts.scrollspeed*10);
	}
}	


//包装一下 以适应以前的代码



var scrollPic=function(){
	var s=new ScrollPic();
	var fixOldCode=function(id){
		var o=document.getElementById(id);
		var lis=o.getElementsByTagName("li");
		var i=0,len=lis.length;
		for(;i<len;){
			lis[i++].style.display="inline";	
		}
	}
	this.init=function(opts){
		s.init(opts)
		fixOldCode(opts.id);
	}
	this.onlclick=function(){
		s.left();	
	}
	this.onrclick=function(){
		s.right();	
	}	
}






