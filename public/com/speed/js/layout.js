// layout.js
com = _.extend({}, com);
(function(window){
	Object.defineProperty(Layout, "PIN_LEFT_TOP", { value: 'leftTop' });
	Object.defineProperty(Layout, "PIN_LEFT_BOTTOM", { value: 'leftBottim' });
	Object.defineProperty(Layout, "PIN_LEFT", { value: 'left' });
	Object.defineProperty(Layout, "PIN_RIGHT_TOP", { value: 'rightTop' });
	Object.defineProperty(Layout, "PIN_RIGHT_BOTTOM", { value: 'rightBottom' });
	Object.defineProperty(Layout, "PIN_RIGHT", { value: 'right' });
	Object.defineProperty(Layout, "PIN_TOP", { value: 'top' });
	Object.defineProperty(Layout, "PIN_BOTTOM", { value: 'bottom' });
	Object.defineProperty(Layout, "PIN_CENTER", { value: 'center' });

	Object.defineProperty(Layout, "NONE", { value: 'none' });
	Object.defineProperty(Layout, "PROPORTIONAL_INSIDE", { value: 'proportionalInside' });
	Object.defineProperty(Layout, "PROPORTIONAL_OUTSIDE", { value: 'proportionalOutside' });
	Object.defineProperty(Layout, "STRETCH", { value: 'stretch' });
	Object.defineProperty(Layout, "STRETCH_WIDTH", { value: 'stretchWidth' });
	Object.defineProperty(Layout, "STRETCH_HEIGHT", { value: 'stretchHeight' });

	Object.defineProperty(Layout, "ALIGN_LEFT", { value: 'left' });
	Object.defineProperty(Layout, "ALIGN_RIGHT", { value: 'right' });
	Object.defineProperty(Layout, "ALIGN_CENTER", { value: 'center' });
	Object.defineProperty(Layout, "ALIGN_TOP", { value: 'top' });
	Object.defineProperty(Layout, "ALIGN_BOTTOM", { value: 'bottom' });
	Object.defineProperty(Layout, "ALIGN_MIDDLE", { value: 'middle' });

	Object.defineProperty(Layout, "STATE_ADDED", { value: 'added' });
	Object.defineProperty(Layout, "STATE_UPDATE", { value: 'update' });


	function Layout(options){
		options = _.extend({
			width: 600,
			height: 800,
			minWidth: 0,
			minHeight: 0,
			maxWidth: Number.MAX_VALUE,
			maxHeight: Number.MAX_VALUE,
			isDebug: false,
		}, options);
		this.options = options;

		this.originalWidth = options.width;
		this.originalHeight = options.height;
		this.currentWidth = options.width;
		this.currentHeight = options.height;
		this.maxScaleX = options.maxHeight / options.width;
		this.maxScaleY = options.maxHeight / options.height;
		this.minScaleX = options.minWidth / options.width;
		this.minScaleY = options.minHeight / options.height;
		this.scaleX = 1;
		this.scaleY = 1;

		if(this.init){
			this.init();
		}

		this.pinArray = [];

		this.resized = new signals.Signal(); 

		Layout.instance = this;
	}
	com.Layout = Layout;

	// Private
	function pinResize(item){
		var layout = item.layout;
		switch(item.type){
			case Layout.PIN_LEFT_TOP:
				// x is default
				// y is default
				break;
			case Layout.PIN_TOP:
				item.obj.x += layout.deltaWidth * 0.5;
				// y is default
				break;
			case Layout.PIN_RIGHT_TOP:
				item.obj.x += layout.deltaWidth;
				// y is default
				break;
			case Layout.PIN_RIGHT:
				item.obj.x += layout.deltaWidth;
				// y is default
				break;
			case Layout.PIN_RIGHT_BOTTOM:
				item.obj.x += layout.deltaWidth;
				item.obj.y += layout.deltaHeight;
				break;
			case Layout.PIN_BOTTOM:
				item.obj.x += layout.deltaWidth * 0.5;
				item.obj.y += layout.deltaHeight;
				break;
			case Layout.PIN_LEFT_BOTTOM:
				// x is default
				item.obj.y += layout.deltaHeight;
				break;
			case Layout.PIN_LEFT:
				// x is default
				item.obj.y += layout.deltaHeight * 0.5;
				break;
			case Layout.PIN_CENTER:
				item.obj.x += layout.deltaWidth * 0.5;
				item.obj.y += layout.deltaHeight * 0.5;
				break;
		}
	}

	// Public
	Layout.prototype.resize = function(width, height) {

		this.scaleX = width / this.originalWidth;
		this.scaleX = Math.min(this.maxScaleX, this.scaleX);
		this.scaleX = Math.max(this.minScaleX, this.scaleX);
		this.scaleY = height / this.originalHeight;
		this.scaleY = Math.min(this.maxScaleY, this.scaleY);
		this.scaleY = Math.max(this.minScaleY, this.scaleY);
		if(this.scaling){
			this.scaling(this.scaleX, this.scaleY);
		}

		this.deltaWidth = width - this.currentWidth;
		this.deltaHeight = height - this.currentHeight;
		_.each(this.pinArray, pinResize);
		this.currentWidth = width;
		this.currentHeight = height;

		this.resized.dispatch(this, width, height);
	};

	Layout.prototype.pin = function(obj, pinTo) {
		this.unpin(obj);
		var pin = new com.Layout.Pin(this, obj, pinTo);
		this.pinArray.push(pin);
		if(this.pinAdded){
			this.pinAdded(obj, pin);
		}
	};

	Layout.prototype.unpin = function(obj) {
		this.pinArray = _.reject(this.pinArray, function(item){
			return item.obj === obj;
		});
	};

	// Pin Decleration

	function Pin(layout, obj, type){
		this.layout = layout;
		this.obj = obj;
		this.type = type;
	}
	com.Layout.Pin = Pin;

	// Area
	com.LayoutArea = LayoutArea;
	function LayoutArea(x, y, width, height, options) {
		options = _.extend({
			width: width,
			height: height,
			x: x,
			y: y,
			layout: Layout.instance,
			isDebug: false,
		},options);
		this.options = options;

		this.attachArray = [];
		this.originalWidth = options.width;
		this.originalHeight = options.height;
		this.layout = options.layout;
		this.layout.resized.add(this.resize.bind(this));

		if(this.init){
			this.init();
		}

		this.x = options.x;
		this.y = options.y;

		this.resized = new signals.Signal();
		this.resize();
	}

	LayoutArea.prototype.attach = function(obj, options) {
		// Checking exists
		if(this.getAttached(obj)){
			return;
		}

		// add attached
		options = _.extend({
			width: obj.width - 20,
			height: obj.height - 20,
			alignHorizontal: Layout.ALIGN_CENTER,
			alignVertical: Layout.ALIGN_MIDDLE,
			mode: Layout.PROPORTIONAL_INSIDE,
		}, options);
		var item = { obj: obj, options: options, state: Layout.STATE_ADDED };
		this.attachArray.push(item);
		this.scaleAttached(item);
		item.state = Layout.STATE_UPDATE;
	}

	LayoutArea.prototype.unattach = function(obj) {
		// check not exists
		if(!this.getAttached(obj)){
			return false;
		}

		// remove attached
		this.attachArray = _.reject(this.attachArray, function(){
			return obj === obj;
		});
		return true;
	}

	LayoutArea.prototype.getAttached = function(obj) {
		return _.findWhere(this.attachArray, { obj: obj });
	}

	LayoutArea.prototype.resize = function() {
		this.currentX = this.options.x * this.layout.scaleX;
		this.currentY = this.options.y * this.layout.scaleY;
		this.currentWidth = this.options.width * this.layout.scaleX;
    	this.currentHeight = this.options.height * this.layout.scaleY;
		_.each(this.attachArray, this.scaleAttached.bind(this));
		this.resized.dispatch(this.currentWidth, this.currentHeight);
	};

	LayoutArea.prototype.scaleAttached = function(item) {
		var data;
		switch(item.options.mode){
			case Layout.PROPORTIONAL_INSIDE:
				data = this.proportionalInside(item);
				break;
			case Layout.PROPORTIONAL_OUTSIDE:
				data = this.proportionalOutside(item);
				break;
			case Layout.STRETCH:
				data = this.stretch(item);
				break;
			case Layout.STRETCH_WIDTH:
				data = this.stretchWidth(item);
				break;
			case Layout.STRETCH_HEIGHT:
				data = this.stretchHeight(item);
				break;
			case Layout.NONE:
				data = this.none(item);
				break;
			default: 
				return;
		}
		this.setScale(item, data);
	};

	LayoutArea.prototype.proportionalOutside = function(item) {
		var data = {};
		var scale;
		var w = this.currentWidth / item.options.width;
	    var h = this.currentHeight / item.options.height;
		if(w < h){
			scale = h;
			data.x = this.currentWidth * 0.5 - item.options.width * scale * 0.5;
	    	data.y = this.currentY;
		} else {
			scale = w;
	    	data.x = this.currentX;
	    	data.y = this.currentHeight * 0.5 - item.options.height * scale * 0.5;
		}
		data.scaleX = scale;
		data.scaleY = scale;
		return data;
	}

	LayoutArea.prototype.proportionalInside = function(item) {
		var data = {};
		var scale;
		var w = this.currentWidth / item.options.width;
	    var h = this.currentHeight / item.options.height;
		if(w > h){
			scale = h;
			data.x = this.alignHorizontal(item, scale);
	    	data.y = this.currentY;
		} else {
			scale = w;
	    	data.x = this.currentX;
	    	data.y = this.alignVertical(item, scale);
		}
		data.scaleX = scale;
		data.scaleY = scale;
		return data;
	};

	LayoutArea.prototype.stretch = function(item) {
		return { scaleX: this.currentWidth / item.options.width, scaleY: this.currentHeight / item.options.height, x: this.currentX, y: this.currentY };
	}

	LayoutArea.prototype.stretchWidth = function(item) {
		return { scaleX: this.currentWidth / item.options.width, x: this.currentX, y: this.alignVertical(item, 1) };
	}

	LayoutArea.prototype.stretchHeight = function(item) {
		return { scaleY: this.currentHeight / item.options.height, x: this.alignHorizontal(item, 1), y: this.currentY };
	}

	LayoutArea.prototype.none = function(item) {
		return { x: this.alignHorizontal(item, 1), y: this.alignVertical(item, 1) };
	}

	LayoutArea.prototype.alignHorizontal = function(item, scale) {
		switch(item.options.alignHorizontal){
			case Layout.ALIGN_LEFT:
				return this.currentX;
			case Layout.ALIGN_CENTER:
				return this.currentX + this.currentWidth * 0.5 - item.options.width * scale * 0.5;
			case Layout.ALIGN_RIGHT:
				return this.currentX + this.currentWidth - item.options.width * scale;
		}
	};

	LayoutArea.prototype.alignVertical = function(item, scale) {
		switch(item.options.alignVertical){
			case Layout.ALIGN_TOP:
				return this.currentY;
			case Layout.ALIGN_MIDDLE:
				return this.currentY + this.currentHeight * 0.5 - item.options.height * scale * 0.5;
			case Layout.ALIGN_BOTTOM:
				return this.currentY + this.currentHeight - item.options.height * scale;
		}
	}

})(window)


