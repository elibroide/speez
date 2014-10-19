// colorBox.js
com.speez.components = _.extend(com.speez.components, {});
com.speez.components.ColorBox = (function(){

	// prototype function
	ColorBox = function (x, y, width, height, color, options) {
		options = $.extend({
			width: width,
			height: height,
			color: color,
			text: '',
			format: {
				font: "24px Arial",
		        fill: "#eeeeee",
		        align: "center"
			},
			anchorX: 1,
			anchorY: 1,
			textColorMode: ColorBox.TEXT_COLOR_MODE_NONE,
		}, options);

	    // constructor
	    var rect = new Phaser.Rectangle(width * (options.anchorX - 1), height * (options.anchorY - 1), width, height);
	    Phaser.Sprite.call(this, game, x, y);
	    this.anchor.set(options.anchorX, options.anchorY);

	    // background
	    this.background = new Phaser.Graphics(game);
		this.background.beginFill(options.color)
	    this.background.drawRect(rect.x, rect.y, rect.width, rect.height);
	    this.box = this.background.graphicsData[0];
	    this.addChild(this.background);

	    // text
	    this.text = new Phaser.Text(game, width * 0.5 + rect.x, height * 0.5 + rect.y, options.text, options.format);
	    this.text.anchor.set(0.5);
	    this.addChild(this.text);

		this.changed = new signals.Signal(); 
	    this.change(options);
	}

	// Constants
	Object.defineProperty(ColorBox, "TEXT_COLOR_MODE_NONE", { value: 'none' });
	Object.defineProperty(ColorBox, "TEXT_COLOR_MODE_NEGATIVE", { value: 'negative' });

	// Constructors
	ColorBox.prototype = Object.create(Phaser.Sprite.prototype);
	ColorBox.prototype.constructor = ColorBox;

	// Methods
	ColorBox.prototype.setText = function(text) {
		this.text.text = text;
	}

	ColorBox.prototype.change = function(options, isUpdateCache) {
		
		options = $.extend(this.options, options);
		this.options = options;

		// this.box.points[0] = -options.anchorX * this.width; 
		// this.box.points[1] = -options.anchorY * this.height;
		// this.box.points[2] = this.width;
		// this.box.points[3] = this.height;
		this.box.fillColor = options.color;
		this.changed.dispatch(options.color);

		if(this.text.text){
			this.changeText(options);
		}
		if(isUpdateCache){
			this.background.updateCache();
		}
	}

	ColorBox.prototype.changeText = function(options) {
		if(options.textColorMode === ColorBox.TEXT_COLOR_MODE_NEGATIVE){
			var rbg = Phaser.Color.getRGB(options.color);
			this.text.fill = Phaser.Color.RGBtoString(255 - rbg.r, 255 - rbg.g, 255 - rbg.b, 255, '#');
		}
	};

	ColorBox.prototype.tweenColor = function(color, time) {
		var _self = this;
		if(this.tween){
			this.tween.stop();
			this.tween = null;
		}
		var func = function(color){
			this.change({color: color})
		}.bind(this);
		this.tween = common.tweenTint(func, this.box.fillColor, color, time * 1000)
		this.tween.onComplete.add(function(){
			_self.tween = null;
		});
		return this.tween;
	};

	return ColorBox;
})()
