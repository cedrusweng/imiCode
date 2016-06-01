var gonzales={};

gonzales.cssToAST=cssToAST;
gonzales.astToCSS=astToCSS;

var defaultConfig={
    "always-semicolon": true,
    "block-indent": "\n",
    "colon-space": ["", " "],
    "color-case": "lower",
    "color-shorthand": false,
    "combinator-space": [" ", " "],
    "element-case": "lower",
    "eof-newline": true,
    "leading-zero": true,
    "quotes": "single",
    "remove-empty-rulesets": true,
    "rule-indent": "    ",
    "stick-brace": " ",
    "strip-spaces": false,
    "unitless-zero": false,
    "vendor-prefix-align": true,
    "sort-order": [        
        [
            "display",
            "visibility",
			"list-style",
            "list-style-position",
            "list-style-type",
            "list-style-image",
			"position",
			"top",
            "right",
            "bottom",
            "left",
			"z-index",
			"float",
            "clear",
			
			
			
			"-webkit-box-sizing",
            "-moz-box-sizing",
            "box-sizing",
            "width",
            "min-width",
            "max-width",
            "height",
            "min-height",
            "max-height",
			"overflow",
            "overflow-x",
            "overflow-y",
            "-ms-overflow-x",
            "-ms-overflow-y",
            "clip",
            "margin",
            "margin-top",
            "margin-right",
            "margin-bottom",
            "margin-left",
            "padding",
            "padding-top",
            "padding-right",
            "padding-bottom",
            "padding-left",
			"outline",
            "outline-width",
            "outline-style",
            "outline-color",
            "outline-offset",
			
			"border",
            "border-width",
            "border-style",
            "border-color",
            "border-top",
            "border-top-width",
            "border-top-style",
            "border-top-color",
            "border-right",
            "border-right-width",
            "border-right-style",
            "border-right-color",
            "border-bottom",
            "border-bottom-width",
            "border-bottom-style",
            "border-bottom-color",
            "border-left",
            "border-left-width",
            "border-left-style",
            "border-left-color",
            "-webkit-border-radius",
            "-moz-border-radius",
            "border-radius",
            "-webkit-border-top-left-radius",
            "-moz-border-radius-topleft",
            "border-top-left-radius",
            "-webkit-border-top-right-radius",
            "-moz-border-radius-topright",
            "border-top-right-radius",
            "-webkit-border-bottom-right-radius",
            "-moz-border-radius-bottomright",
            "border-bottom-right-radius",
            "-webkit-border-bottom-left-radius",
            "-moz-border-radius-bottomleft",
            "border-bottom-left-radius",
            "-webkit-border-image",
            "-moz-border-image",
            "-o-border-image",
            "border-image",
            "-webkit-border-image-source",
            "-moz-border-image-source",
            "-o-border-image-source",
            "border-image-source",
            "-webkit-border-image-slice",
            "-moz-border-image-slice",
            "-o-border-image-slice",
            "border-image-slice",
            "-webkit-border-image-width",
            "-moz-border-image-width",
            "-o-border-image-width",
            "border-image-width",
            "-webkit-border-image-outset",
            "-moz-border-image-outset",
            "-o-border-image-outset",
            "border-image-outset",
            "-webkit-border-image-repeat",
            "-moz-border-image-repeat",
            "-o-border-image-repeat",
            "border-image-repeat",
            
			
			"background",
            "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader",
            "background-color",
            "background-image",
            "background-repeat",
            "background-attachment",
            "background-position",
            "background-position-x",
            "-ms-background-position-x",
            "background-position-y",
            "-ms-background-position-y",
            "-webkit-background-clip",
            "-moz-background-clip",
            "background-clip",
            "background-origin",
            "-webkit-background-size",
            "-moz-background-size",
            "-o-background-size",
            "background-size",
            "box-decoration-break",
            "-webkit-box-shadow",
            "-moz-box-shadow",
            "box-shadow",
            "filter:progid:DXImageTransform.Microsoft.gradient",
            "-ms-filter:\\'progid:DXImageTransform.Microsoft.gradient",
			"color",
			
			"font",
            "font-family",
            "font-size",
            "font-weight",
            "font-style",
            "font-variant",
            "font-size-adjust",
            "font-stretch",
            "font-effect",
            "font-emphasize",
            "font-emphasize-position",
            "font-emphasize-style",
            "font-smooth",
            "line-height",
			"text-align",
            "-webkit-text-align-last",
            "-moz-text-align-last",
            "-ms-text-align-last",
            "text-align-last",
            "vertical-align",
            "white-space",
            "text-decoration",
            "text-emphasis",
            "text-emphasis-color",
            "text-emphasis-style",
            "text-emphasis-position",
            "text-indent",
            "-ms-text-justify",
            "text-justify",
            "letter-spacing",
            "word-spacing",
            "-ms-writing-mode",
            "text-outline",
            "text-transform",
            "text-wrap",
            "text-overflow",
            "-ms-text-overflow",
            "text-overflow-ellipsis",
            "text-overflow-mode",
            "-ms-word-wrap",
            "word-wrap",
            "word-break",
            "-ms-word-break",
            "-moz-tab-size",
            "-o-tab-size",
            "tab-size",
            "-webkit-hyphens",
            "-moz-hyphens",
            "hyphens",
            "pointer-events",
			
			"cursor",
            
            "zoom",
            "flex-direction",
            "flex-order",
            "flex-pack",
            "flex-align"
        ]
    ]
};

var xcarCssStyle=function(config){
	this.SUPPORTED_SYNTAXES = ['css'];//支持格式
    this._options = [//配置
        'remove-empty-rulesets',
        'always-semicolon',
        'color-case',
        'color-shorthand',
        'element-case',
        'leading-zero',
        'quotes',
        'strip-spaces',
        'eof-newline',
        'stick-brace',
        'colon-space',
        'combinator-space',
        'rule-indent',
        'block-indent',
        'unitless-zero',
        'sort-order',
        'vendor-prefix-align'
    ];
    this._exclude = null;//运行
    this._detect = false;//侦测

    // If config was passed, configure://如果配置过时
    config=config||defaultConfig;
	this.configure(config);
    // Return Comb's object to make creating new instance chainable: 返回实体以方便链式调用
    return this;
}







xcarCssStyle.forEach=function(arr,fn,context){
	for(var i=0,len=arr.length;i<len;i++){
		fn.call(context||arr[i],arr[i],i,arr);	
	}	
}



xcarCssStyle.prototype={
	getConfig: function() {//读取配置
        return defaultConfig;
    },
	configure: function(config) {
        this._handlers = [];
		xcarCssStyle.forEach(this._options,function(option){
			if(typeof cssStyle[option]==='undefined')return;
			try{
				//console.log(cssStyle[option].setValue)
				var handler=cssStyle[option].setValue(config[option]);	
			}catch(e){
				return;	
			}
		},this)
		
		
        this.processed = 0;
        this.tbchanged = 0;
        this.changed = 0;
        this._verbose = config.verbose;
        // Return Comb's object to make the method chainable:
        return this;
    },
	detectInString: function(text, options) {
        var result;
        this._detect = true;
        this._detected = {};
        this._handlers = [];
		
       xcarCssStyle.forEach( this._options,function(option) {		  
            try {
                var handler = cssStyle[option];
                if (!handler || options && options.indexOf(option) === -1) return;

                handler._name = option;
				
                this._detected[option] = [];
				
                this._handlers.push(handler);
            } catch (e) {
				return;
            }
        }, this);

        result = this.processString(text);
        this._detect = false;
        return result;
    }, processString: function(text, syntax) {
        if (!text) return text;
        var tree;
        //获取了抽象语法树		
        tree = gonzales.cssToAST({ syntax: syntax, css: text });

        if (typeof tree === 'undefined') {
            return
        }
        //运行语法树
		tree = this.processTree(tree);
		
        return gonzales.astToCSS({ syntax: syntax, ast: tree });       
    },processTree: function(tree) {
        // We walk across complete tree for each handler,
        // because we need strictly maintain order in which handlers work,
        // despite fact that handlers work on different level of the tree.
        xcarCssStyle.forEach(this._handlers,function(handler) {
            this.processNode(['tree', tree], 0, handler);
        }, this);
        return tree;
    }, processNode: function(node, level, handler) {
		
       xcarCssStyle.forEach(node,function(node) {
            if (!Array.isArray(node)) return;			
            var nodeType = node.shift();
			//console.log('nodeType:'+nodeType+",node:"+node+",level:"+level)
            handler.process(nodeType, node, level);
			
			           
            node.unshift(nodeType);
            if (nodeType === 'atrulers') level++;
            this.processNode(node, level, handler);
        }, this);
	}

}
