// menuButton.js
com.speez.components = _.extend({}, com.speez.components);
com.speez.components.MenuButton = (function(){

	MenuButton = function (x, y, width, height, options) {
		options = $.extend({
			format: {
		        font: "24px Arial",
		        fill: "#000000",
		        align: "center"
		    },
		    textColor: 0x000000,
		    color: 0xe1e1e1,
		    textColorOver: 0xe1e1e1,
		    colorOver: 0x000000,
		    textColorDown: 0x000000,
		    colorDown: 0xffffff,
		    isOnce: false,
		    radius: 0,
		    borderColor: 0x000000,
		    borderWidth: 0,
		    colorTime: 0.2,
		    text: '',
		}, options);
		this.options = options;
		this.options.format.fill = '#' + common.toRgbHex(this.options.textColor);

		var solid = new Phaser.Graphics(game);
		// solid.beginFill(0xff00ff);
		solid.drawRect(0, 0, width, height);
	    Phaser.Sprite.call(this, game, x, y, solid.generateTexture());
	    this.anchor.set(0.5);

	    // Adding background
	    this.background = new Phaser.Graphics(game, -width / 2, -height / 2);
	    this.background.beginFill(this.options.color);
	    this.background.lineWidth = this.options.borderWidth;
	    this.background.lineColor = this.options.borderColor;
	    this.background.drawRoundedRect(0, 0, width, height, this.options.radius);
	    this.background.colorChange = common.graphicsColorChange(0);
	    this.addChild(this.background);

	    // text
	    this.text = new Phaser.Text(game, 0, 0, this.options.text, this.options.format);
	    this.text.anchor.set(0.5);
	    this.text.colorChange = common.textColorChange();
	    this.addChild(this.text);

	    // Events
	    this.inputEnabled = true;
	    this.events.onInputOut.add(onInputOut, this);
	    this.events.onInputOver.add(onInputOver, this);
	    this.events.onInputDown.add(onInputDown, this);
	    this.events.onInputUp.add(onInputUp, this);
	    if(options.isOnce) {
	    	this.events.onInputUp.addOnce(click, this);
	    }
	    else{
	    	this.events.onInputUp.add(click, this);
	    }

	    this.enable = true;

	    this.events.onDestroy.add(onDestroy, this);
	}

	// Constructors
	MenuButton.prototype = Object.create(Phaser.Sprite.prototype);
	MenuButton.prototype.constructor = MenuButton;

	// private methods

	function onInputOut(){
		if(!this.enable){
			return;
		}
		this.tweenColor(this.options.color, this.options.textColor);
	}

	function onInputOver(){
		if(!this.enable){
			return;
		}
		this.tweenColor(this.options.colorOver, this.options.textColorOver);
	}

	function onInputDown(){
		if(!this.enable){
			return;
		}
		this.tweenColor(this.options.colorDown, this.options.textDownColor);
	}

	function onInputUp(){
		if(!this.enable){
			return;
		}
		this.tweenColor(this.options.color, this.options.textColor);
	}

	function onDestroy(){
		TweenMax.killTweensOf(this.background);
		TweenMax.killTweensOf(this.text);
	}

	function click(){
		if(!this.enable){
			return;
		}
		if(this.options.callback){
			this.options.callback.call(this);
		}
	}

	// public methods

	MenuButton.prototype.setColor = function(color) {
		this.background.change({color: color});
	}

	MenuButton.prototype.setText = function(text) {
		this.text.text = text;
	};

	MenuButton.prototype.tweenColor = function(color, textColor) {
		var timeline = new TimelineMax();
		timeline.to(this.background, this.options.colorTime, { colorProps: { colorChange: color } });
		timeline.to(this.text, this.options.colorTime, { colorProps: { colorChange: textColor } }, 0)
		return timeline;
	};

	MenuButton.prototype.setEnable = function(enable) {
		this.enable = enable;
	};

})();
















