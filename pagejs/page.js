// JavaScript Document
/**
	����һ�����ɷ�ҳ�Ĳ����
	1��������Ϣ��������ÿҳ����Ϣ������ȷ����ǰ����ҳ����
	2����������һ����ʾ���ٸ���ҳ��
	3���������ǰҳ��ʱ���������õĻص�����
	4�����õ�ǰҳ����ʽ
	5�����ɵ��״̬����ʽ
*/



/**
	����һ�����ɷ�ҳ�Ĳ����
	1��������Ϣ��������ÿҳ����Ϣ������ȷ����ǰ����ҳ����
	var itemCount,
		pageItemCount,
		pageCount=itemCount/pageItemCount;
	
	2����������һ����ʾ���ٸ���ҳ��
	var numCount
	3����ǰҳ��ʱ���������õĻص�����
	itemCallHandle=function(i){
		//���õ�������ҳ���¼�ʱ���ص��Ĳ�����
	}
	4�����õ�ǰҳ����ʽ
	var currentPage
	5�����ɲ���״̬����ʽ
	var unOperation
*/

/**
	����һ�����ɷ�ҳ�Ĳ����
	1��������Ϣ��������ÿҳ����Ϣ������ȷ����ǰ����ҳ����
	var itemCount,
		pageItemCount,
		pageCount=itemCount/pageItemCount;
	
	2����������һ����ʾ���ٸ���ҳ��
	var numCount
	3����ǰҳ��ʱ���������õĻص�����
	itemCallHandle=function(i){
		//���õ�������ҳ���¼�ʱ���ص��Ĳ�����
	}
	4�����õ�ǰҳ����ʽ
	var currentPage
	5�����ɲ���״̬����ʽ
	var unOperation
	
	��ҳ��������
	���ԣ�
		itemCount//������
		pageItemCount//ÿ��ҳ�������
		pageCount//��ҳ��
		numCount//��ʾ���ٸ���ҳ��
		pageHandleEvent//�¼�����
		pageHandle//�ص��¼�
		currentPage//��ǰҳ����ʽ
		unOperation//���ɲ�����ʽ
		currentPageCount
	������
		init//��ʼ����ҳ
		setup//����html�ṹ
		refresh//ˢ��ҳ����ݵ�ǰ������ҳ��
		
*/


/*
	var list={
		parent://��ҳ����ǩ
		prevBtn:,//��һҳ
		nextBtn:,//��һҳ
		itemTag:,//��ҳ��ǩ
		current:,//��ǩ��ǰ��
		disable://���ɵ��
	}
*/

function Page(opts){
	this.itemCount=opts.itemCount||200;//������
	this.pageItemCount=opts.pageItemCount||10;//ÿ��ҳ�������
	this.pageCount=Math.ceil(this.itemCount/this.pageItemCount);//��ҳ��
	this.numCount=opts.numCount||9;//��ʾ���ٸ���ҳ��
	this.pageHandleEvent=opts.pageHandleEvent||'click';//�¼�����
	this.pageHandle=opts.pageHandle||function(){};
	this.list=opts.list;
	this._currentPage=opts.currentPage||1;
	this.init();
}
Page.prototype={
	counstructor:Page,
	init:function(){
		//��ʼ��		
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
		//����ǰһҳ����һҳ��href����
		this.prevBtn.href='/'+(currentPage-1);
		this.nextBtn.href='/'+(currentPage+1);
		this.nextBtn['on'+that.pageHandleEvent]=this.prevBtn['on'+that.pageHandleEvent]=function(e){
					that.itemHandle(e);
					return false;
		}
		//�ж�currentPage�Ƿ��ǵ�һҳ�����һҳ
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