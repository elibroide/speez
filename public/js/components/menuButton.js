// menuButton.js
com.speez.components = _.extend({}, com.speez.components);
com.speez.components.MenuButton = (function(){

	MenuButton = function (x, y, width, height, text, callback, options) {
		options = $.extend({
			format: {
		        font: "24px Arial",
		        fill: "#000000",
		        align: "center"
		    },
		    color: 0xffffff,
		    overColor: 0x000000,
		    downColor: 0xffffff,
		    tweenRate: 0.2,
		    anchorX: 1,
		    anchorY: 1,
		    isOnce: false,
		}, options);
		this.options = options;

		var solid = new Phaser.Graphics(game);
		// solid.beginFill(0xff00ff);
		solid.drawRect(0, 0, width, height);
	    Phaser.Sprite.call(this, game, x, y, solid.generateTexture());
	    this.anchor.set(0.5);
	    game.add.existing(this);

	    // Adding background
	    this.background = new ColorBox(-width * 0.5, -height * 0.5, width, height, options.color, {
	    	format: options.format,
	    });
	    this.background.setText(text);
	    this.background.options.textColorMode = com.speez.components.ColorBox.TEXT_COLOR_MODE_NEGATIVE;
	    this.addChild(this.background);

	    // Properties
	    this.inputEnabled = true;
	    this.events.onInputOut.add(function(){
	    	this.background.tweenColor(this.options.color, this.options.tweenRate);
	    }.bind(this));
	    this.events.onInputOver.add(function(){
	    	this.background.tweenColor(this.options.overColor, this.options.tweenRate);
	    }.bind(this));
	    this.events.onInputDown.add(function(){
	    	this.background.tweenColor(this.options.downColor, this.options.tweenRate);
	    }.bind(this));
	    
	    if(!callback){
	    	return;
	    }
	    if(options.isOnce) {
	    	this.events.onInputDown.addOnce(callback);
	    }
	    else{
	    	this.events.onInputDown.add(callback);
	    }
	}

	// Constructors
	MenuButton.prototype = Object.create(Phaser.Sprite.prototype);
	MenuButton.prototype.constructor = MenuButton;

	// Methods
	MenuButton.prototype.setColor = function(color) {
		this.background.change({color: color})
	}

	MenuButton.prototype.setText = function(text) {
		this.background.setText(text);
	};
})()