// BoardFactory.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.BoardFactory = (function(){

	function BoardFactory(){
		this.bitmapDatas = [];
		BoardFactory.instance = this;
	}

	// constants
	Object.defineProperty(BoardFactory, "TYPE_BACK", { value: 'back' });
	Object.defineProperty(BoardFactory, "TYPE_BLUR", { value: 'blur' });

	BoardFactory.prototype.create = function(options) {
		options = _.extend({
			color: 0xff0000,
			name: 0xff0000,
			backRadius: 100,
			blurRadius: 50,
			blurIntensityBegin: 0,
			blurIntensityEnd: 1,
		}, options);

		if(this.bitmapDatas[options.name]){
			return this.bitmapDatas[options.name];
		}

		this.radius = options.backRadius + options.blurRadius;
		this.diameter = this.radius * 2;
		var bmd = game.add.bitmapData(this.diameter, this.diameter);
    	this.createBlur(bmd, options);
    	this.createBack(bmd, options);

	    game.cache.addBitmapData(options.name + BoardFactory.TYPE_BACK, bmd);

	    this.bitmapDatas[options.name] = true;
	};

	BoardFactory.prototype.createBack = function(bmd, options) {
		var context = bmd.context;
		context.fillStyle = common.toRgb(options.color);
	    context.beginPath();
		context.arc(this.radius, this.radius, options.backRadius, 0, 2 * Math.PI, false);
		context.fill();
		context.closePath();
	};

	BoardFactory.prototype.createBlur = function(bmd, options) {
		var context = bmd.context;
		// var blurColor = common.brightness(options.color, options.blurBrightness);
		var grd = context.createRadialGradient(this.radius, this.radius, this.radius * 1, this.radius, this.radius, this.radius * 0);
		grd.addColorStop(0, common.toRgba(options.blurColor, options.blurIntensityBegin));
		grd.addColorStop(1, common.toRgba(options.blurColor, options.blurIntensityEnd));
		context.fillStyle = grd;
	    context.beginPath();
		context.arc(this.radius, this.radius, this.radius + options.blurRadius, 0, 2 * Math.PI, false);
		context.fill();
		context.closePath();
	};

	BoardFactory.prototype.get = function(name, type) {
		if(!this.bitmapDatas[name]){
			return;
		}
		return game.cache.getBitmapData(name + type);
	};

	BoardFactory.prototype.remove = function(name) {
		if(!this.bitmapDatas[name]){
			return;
		}
		delete this.bitmapDatas[name];
		game.cache.removeBitmapData(name);
	};

    return BoardFactory;
})();
new com.speez.components.BoardFactory();
var BoardFactory = com.speez.components.BoardFactory;










