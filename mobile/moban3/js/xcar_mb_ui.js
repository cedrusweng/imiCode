(function(z) {
	var app = {},
	hasTouch = 'ontouchstart' in window;
	has3d = ("WebKitCSSMatrix" in window) && ("m11" in new WebKitCSSMatrix());
	RESIZE_EV = 'onorientationchange' in window ? 'orientationchange' : 'resize',
	isIphone=(navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i))?true:false;
	isAndroid=!!(navigator.userAgent.match(/Android/i));
	isMicro=(navigator.userAgent.match(/MicroMessenger/i) )?true:false;
	START_EV = hasTouch ? 'touchstart' : 'mousedown',
	MOVE_EV = hasTouch ? 'touchmove' : 'mousemove',
	END_EV = hasTouch ? 'touchend' : 'mouseup',
	CANCEL_EV = hasTouch ? 'touchcancel' : 'mouseup',
	TAP_EV = hasTouch ? 'tap' : 'click';
	 app.ui = {
		 /*init function*/
		init: function() {
			var that=this;
			that.bind_ev();
		},
		/*bind touch ev   css:  css.touch{touch:style}*/
		bind_ev:function(){
			z(".ev").live(START_EV,function(){
				if(z(this).hasClass("failure"))return;
				z(this).addClass("touch");
			}).live(MOVE_EV,function(){
				z(this).removeClass("touch");
			}).live(END_EV,function(){
				z(this).removeClass("touch");
			}).live(CANCEL_EV,function(){
				z(this).removeClass("touch");
			});
		},
	};
	window.app = app;
})(Zepto);
Zepto(function($){
	app.ui.init();
}); 
	