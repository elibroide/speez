// playerLobby.js
com.speez.components = _.extend({}, com.speez.components);
com.speez.components.PlayerLobby = (function(){

	PlayerLobby = function (x, y, options) {
		options = $.extend({
			format: {
		        font: "47px Arial",
		        fill: "#000000",
		        align: "center"
		    },
		    readyColor: 0xff0000,
		}, options);
		this.options = options;

	    Phaser.Sprite.call(this, game, x, y);
	    game.add.existing(this);

	    this.icon = game.add.text(0, 10, "+", {
	        font: "100px Arial",
	        fill: "#000000",
	        align: "center"
	    });
	    this.icon.currentColor = 0x000000;
	    this.icon.anchor.set(0.5);
	    this.icon.scale.set(2);
	    this.addChild(this.icon);

	    this.name = game.add.text(0, 150, '', options.format);
	    this.name.anchor.set(0.5);
	    this.name.alpha = 0;
	    this.addChild(this.name);

	    this.alpha = 0.5;
	}

	// Constructors
	PlayerLobby.prototype = Object.create(Phaser.Sprite.prototype);
	PlayerLobby.prototype.constructor = PlayerLobby;

	// Methods
	PlayerLobby.prototype.removePlayer = function() {
		this.player = null;
		// player disappear
		var time = 1;
		var tweens = common.tweenSpin(this.icon, time, { isEase: true });
		game.add.tween(this).to({ alpha: 0.5 }, time * 1000).start();
		game.add.tween(this.name).to({ alpha: 0 }, time * 1000).start();
		this.setReady(false, time);
		tweens[0].onComplete.add(function(){
			this.icon.text = '+';
		}.bind(this));
	}

	PlayerLobby.prototype.setPlayer = function(name) {
		// player appear
		this.player = name;
		var time = 1;
		var tweens = common.tweenSpin(this.icon, time, { isEase: true });
		this.name.text = name;
		game.add.tween(this).to({ alpha: 1 }, time * 1000).start();
		game.add.tween(this.name).to({ alpha: 1 }, time * 1000).start();
		tweens[0].onComplete.add(function(){
			this.icon.text = '+';
		}.bind(this));
	};

	PlayerLobby.prototype.setReady = function(isReady, time) {
		if(time === undefined){
			time = 0.2;
		}
		common.tweenTint(function(color){
			this.icon.currentColor = color;
			var rbg = Phaser.Color.getRGB(color);
			this.icon.fill = Phaser.Color.RGBtoString(rbg.r, rbg.g, rbg.b, 255, '#');
		}.bind(this), this.icon.currentColor, isReady ? this.options.readyColor : 0x000000, time * 1000)
	};
})()




