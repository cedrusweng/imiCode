// JavaScript Document
/**
	创建一个生成分页的插件。
	1、根据信息的数量，每页的信息数，来确定当前的总页数。
	2、可以设置一共显示多少个分页项
	3、当点击当前页数时，调用设置的回调函数
	4、设置当前页的样式
	5、不可点击状态的样式
*/



/**
	创建一个生成分页的插件。
	1、根据信息的数量，每页的信息数，来确定当前的总页数。
	var itemCount,
		pageItemCount,
		pageCount=itemCount/pageItemCount;
	
	2、可以设置一共显示多少个分页项
	var numCount
	3、当前页数时，调用设置的回调函数
	itemCallHandle=function(i){
		//设置当发生分页项事件时，回调的操作。
	}
	4、设置当前页的样式
	var currentPage
	5、不可操作状态的样式
	var unOperation
*/

/**
	创建一个生成分页的插件。
	1、根据信息的数量，每页的信息数，来确定当前的总页数。
	var itemCount,
		pageItemCount,
		pageCount=itemCount/pageItemCount;
	
	2、可以设置一共显示多少个分页项
	var numCount
	3、当前页数时，调用设置的回调函数
	itemCallHandle=function(i){
		//设置当发生分页项事件时，回调的操作。
	}
	4、设置当前页的样式
	var currentPage
	5、不可操作状态的样式
	var unOperation
	
	分页插件对象的
	属性：
		itemCount//总条数
		pageItemCount//每个页面的条数
		pageCount//总页数
		numCount//显示多少个分页数
		pageHandleEvent//事件名称
		pageHandle//回调事件
		currentPage//当前页的样式
		unOperation//不可操作样式
		currentPageCount
	方法：
		init//初始化分页
		setup//创建html结构
		refresh//刷新页面根据当前所处的页数
		
*/


/*
	var list={
		parent://分页父标签
		prevBtn:,//上一页
		nextBtn:,//下一页
		itemTag:,//分页标签
		current:,//标签当前类
		disable://不可点击
	}
*/

function Page(opts){
	this.itemCount=opts.itemCount||200;//总条数
	this.pageItemCount=opts.pageItemCount||10;//每个页面的条数
	this.pageCount=Math.ceil(this.itemCount/this.pageItemCount);//总页数
	this.numCount=opts.numCount||9;//显示多少个分页数
	this.pageHandleEvent=opts.pageHandleEvent||'click';//事件名称
	this.pageHandle=opts.pageHandle||function(){};
	this.list=opts.list;
	this._currentPage=opts.currentPage||1;
	this.init();
}
Page.prototype={
	counstructor:Page,
	init:function(){
		//初始化		
		if(this.list){
			this.itemTag=this.list.itemTag;
			this.gotoPage(this._currentPage);			
		}		
	},
	setCurrentPage:function(currentPage){
		if(currentPage>this.pageCount)return;
		this._currentPage=currentPage;
	},
	getCurrentPage:function(){
		return this._currentPage;
	},
	setList:function(list){
		this.list=list;
	},
	gotoPage:function(currentPage){
		
		this.setCurrentPage(currentPage);
		this.list.parent.innerHTML='';		
		this.setupPage(currentPage,this.createPageItems(currentPage),this.list.parent)	
	},
	setupPage:function(currentPage,pageItems,parent){
		var that=this;
		var btnProto=document.createElement(this.list.itemTag);
		this.prevBtn=btnProto.cloneNode();
		this.nextBtn=btnProto.cloneNode();
		this.prevBtn.innerHTML=this.list.prevBtn;
		this.nextBtn.innerHTML=this.list.nextBtn;
		this.prevBtn.className=this.list.prevBtnClass;	
		this.nextBtn.className=this.list.nextBtnClass;
		//设置前一页，后一页的href属性
		this.prevBtn.href='/'+(currentPage-1);
		this.nextBtn.href='/'+(currentPage+1);
		this.nextBtn['on'+that.pageHandleEvent]=this.prevBtn['on'+that.pageHandleEvent]=function(e){
					that.itemHandle(e);
					return false;
		}
		//判断currentPage是否是第一页或最后一页
		if(currentPage==1){
			this.prevBtn.href='/';
			this.prevBtn.className=that.list.prevBtnDisClass||'disable';
			this.prevBtn['on'+that.pageHandleEvent]=function(e){
					return false;
			};
		}
		if(currentPage==this.pageCount){
			this.nextBtn.href='/';
			this.nextBtn.className=that.list.nextBtnDisClass||'disable';
			this.nextBtn['on'+that.pageHandleEvent]=function(e){
					return false;
			};
		}
		
		parent.appendChild(this.prevBtn);		
		parent.appendChild(pageItems);
		parent.appendChild(this.nextBtn);
		
	},
	createPageItems:function(currentPage){
		var that=this,
			page=document.createDocumentFragment(),
			itemProto=document.createElement(that.list.itemTag);
		var i=1,
			len=that.numCount+1;
		if(that.numCount>that.pageCount)len=that.pageCount+1;
		for(;i<len;i++){			
			var oitem=itemProto.cloneNode();
			page.appendChild(oitem);			
			var halfLen=Math.ceil((len-1)/2);	
			pageN=currentPage-halfLen+i;
			oitem.innerHTML=pageN;
			oitem.href='/'+pageN;	
			oitem.className=that.list.itemClass;
			oitem['on'+that.pageHandleEvent]=function(e){
					that.itemHandle(e);
					return false;
			}
			
			if(currentPage<halfLen){
				oitem.innerHTML=i;
				oitem.href='/'+i;
				if(i==currentPage){
					oitem.className=that.list.current;						
				}
				continue;
			}
			
			if(currentPage>that.pageCount-halfLen){
				var isLast=len-(that.pageCount-currentPage)-1;				
				var zero=currentPage-isLast;
				oitem.innerHTML=zero+i;
				oitem.href='/'+(zero+i);
				if(i==isLast){
					oitem.className=that.list.current;					
				}
				continue;
			}
			if(i==halfLen){
				oitem.className=that.list.current;
			}
		}
		return page;
	},
	itemHandle:function(e){
		var e=(e||window.event);
		var target=e.target||e.srcElement;
		var pageNum=parseInt(target.href.replace(/.*\/(\d+)$/,'$1'));
		this.gotoPage(pageNum);
		this.pageHandle(pageNum);	
	}
}