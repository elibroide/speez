// colorBox.js
com.speez.components = _.extend({}, com.speez.components);
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
		this.options = options;

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

	ColorBox.prototype.setColor = function(color) {
		var rgb = Phaser.Color.getRGB(color);
		var text = [ 'rgb(', rgb.r, ',', rgb.g, ',', rgb.b, ')' ].join('');
		this.backgroundColor(text);
	}

	ColorBox.prototype.backgroundColor = function(color) {
		if(color !== undefined){
			this.color = common.getRgb(color);
			this.box.fillColor = this.color;
			if(this.options.textColorMode === ColorBox.TEXT_COLOR_MODE_NEGATIVE){
				var rbg = Phaser.Color.getRGB(this.color);
				this.text.fill = Phaser.Color.RGBtoString(255 - rbg.r, 255 - rbg.g, 255 - rbg.b, 255, '#');
			}
			this.changed.dispatch(this.color);
		}
		return this.box.fillColor;
	};

	ColorBox.prototype.tweenColor = function(color, time) {
		this.tween = TweenLite.to(this, time, { colorProps: { backgroundColor: color } });
		return this.tween;
	};

	return ColorBox;
})()
