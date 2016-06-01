/*
  author:weng.xuesong
  date:2014/7/28
  version 1.0
  picchage is freely distributable under the terms of an MIT-style license.
*/
define('./picchange',['jquery'],function(require,exports,module){
	
	var $=require('jquery');
	
	var defalutOpts ={
		smlRect:{
			w:90,
			h:94
		},
		view:'.viewport',
		leftBtn:'.left',
		rightBtn:'.right',
		items:'li',
		defaultIdx:0	
	}
	function picChange(opts){
		this.opts=$.extend({},defalutOpts,opts);		
		this.curIdx=this.opts.defaultIdx||0;
		this.items=$(this.opts.view).find(this.opts.items);
		this.maxIdx=this.items.size()-1;
		this.setup()
	}
	picChange.prototype={
		setup:function(){
			var self=this;			
			var arr=this.getRenderArr(this.curIdx);
			$(this.items).eq(arr[0]).css({'zIndex':1,width:smlRect.w,height:smlRect.h,left:-(smlRect.w*2+10),top:'50%',marginLeft:0,marginTop:-smlRect.h/2});
			$(this.items).eq(arr[1]).css({'zIndex':2,width:smlRect.w,height:smlRect.h,left:-(smlRect.w+1),top:'50%',marginLeft:0,marginTop:-smlRect.h/2});			
			$(this.items).eq(arr[2]).css({'zIndex':10,width:'100%',height:'100%',left:0,top:0,marginLeft:0,marginTop:0});			
			$(this.items).eq(arr[3]).css({'zIndex':2,width:smlRect.w,height:smlRect.h,left:'100%',top:'50%',marginLeft:1,marginTop:-smlRect.h/2});
			$(this.items).eq(arr[4]).css({'zIndex':1,width:smlRect.w,height:smlRect.h,left:'100%',top:'50%',marginLeft:smlRect.w+10,marginTop:-smlRect.h/2});
			
			$(this.opts.leftBtn).click(function(){
				self.prev();
			})
			$(this.opts.rightBtn).click(function(){
				self.next();
			})			
		},
		next:function(){
			this.curIdx++;
			if(this.curIdx>this.maxIdx)this.curIdx=0;
			this.goto(this.curIdx);
		},
		prev:function(){
			this.curIdx--;
			if(this.curIdx<0)this.curIdx=this.maxIdx;
			this.goto(this.curIdx);
		},
		goto:function(idx){
			var arr=this.getRenderArr(idx);
			this.render(arr);
		},
		getRenderArr:function(idx){
			var arr=[];			
			var specil={
				"0":[this.maxIdx-1,this.maxIdx,0,1,2],
				"1":[this.maxIdx,0,1,2,3]	
			}			
			specil[this.maxIdx-1]=[this.maxIdx-3,this.maxIdx-2,this.maxIdx-1,this.maxIdx,0];
			specil[this.maxIdx]=[this.maxIdx-2,this.maxIdx-1,this.maxIdx,0,1]
			if(idx in specil){
				arr=specil[idx];
			}else{
				arr=[idx-2,idx-1,idx,idx+1,idx+2]	
			}
			return arr;
		},
		render:function(arr){
			var self=this,
				bigRect=this.opts.bigRect,
				smlRect=this.opts.smlRect;
				$(this.items).stop(true,true)		
				$(this.items).eq(arr[0]).css('zIndex',1).animate({width:smlRect.w,height:smlRect.h,left:-(smlRect.w*2+10),top:'50%',marginLeft:0,marginTop:-smlRect.h/2});
				$(this.items).eq(arr[1]).css('zIndex',2).animate({width:smlRect.w,height:smlRect.h,left:-(smlRect.w+1),top:'50%',marginLeft:0,marginTop:-smlRect.h/2});			
				$(this.items).eq(arr[2]).css('zIndex',10).animate({width:'100%',height:'100%',left:0,top:0,marginLeft:0,marginTop:0});			
				$(this.items).eq(arr[3]).css('zIndex',2).animate({width:smlRect.w,height:smlRect.h,left:'100%',top:'50%',marginLeft:1,marginTop:-smlRect.h/2});
				$(this.items).eq(arr[4]).css('zIndex',1).animate({width:smlRect.w,height:smlRect.h,left:'100%',top:'50%',marginLeft:smlRect.w+10,marginTop:-smlRect.h/2});
		}	
	}

	return picChange;
		
})