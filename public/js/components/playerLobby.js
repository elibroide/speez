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
		    icon: '+',
		    iconAlpha: 0.5,
		    iconJoinAlpha: 1,
		    setPlayerTime: 2,
		    readyColorTime: 0.2,
		    readyColor: 0xff0000,
		    changeNameTime: 1,
		}, options);
		this.options = options;

	    Phaser.Sprite.call(this, game, x, y);
	    game.add.existing(this);

	    this.icon = game.add.text(0, 10, "+", {
	        font: "200px Arial",
	        fill: "#000000",
	        align: "center"
	    });
	    this.icon.currentColor = 0x000000;
	    this.icon.anchor.set(0.5);
	    this.icon.colorChange = common.textColorChange();
	    this.icon.alpha = options.iconAlpha;
	    this.addChild(this.icon);

	    this.name = game.add.text(0, 150, '', options.format);
	    this.name.anchor.set(0.5);
	    this.name.alpha = 0;
	    this.addChild(this.name);
	}

	// Constructors
	PlayerLobby.prototype = Object.create(Phaser.Sprite.prototype);
	PlayerLobby.prototype.constructor = PlayerLobby;

	// Methods
	PlayerLobby.prototype.removePlayer = function() {
		this.player = null;
		// player disappear
		this.player = name;
		this.icon.angle = 360;
		var timeline = new TimelineLite();
		timeline.to(this.icon, this.options.setPlayerTime, { angle: 0, ease: Elastic.easeInOut });
		timeline.addLabel('half', this.options.setPlayerTime * 0.5);
		timeline.to(this.name, this.options.setPlayerTime * 0.5, { alpha: 0 }, 'half');
		timeline.to(this.icon, this.options.setPlayerTime * 0.5, { alpha: this.options.iconAlpha }, 'half');
		return timeline;
	}

	PlayerLobby.prototype.setPlayer = function(name) {
		// player appear
		this.player = name;
		this.name.text = name;
		this.icon.angle = 0;
		var timeline = new TimelineLite();
		timeline.to(this.icon, this.options.setPlayerTime, { angle: 360, ease: Elastic.easeInOut });
		timeline.addLabel('half', this.options.setPlayerTime * 0.5);
		timeline.to(this.name, this.options.setPlayerTime * 0.5, { alpha: 1 }, 'half');
		timeline.to(this.icon, this.options.setPlayerTime * 0.5, { alpha: this.options.iconJoinAlpha }, 'half');
		return timeline;
	};

	PlayerLobby.prototype.setReady = function(isReady) {
		return TweenLite.to(this.icon, this.options.readyColorTime, { colorProps: { colorChange: isReady ? this.options.readyColor : 0x000000 } });
	};
	
	PlayerLobby.prototype.changeName = function(name) {
		var timeline = new TimelineLite();
		timeline.to(this.name, this.options.changeNameTime * 0.5, { alpha: 0 });
		timeline.addLabel('half');
		timeline.to(this.name, this.options.changeNameTime * 0.5, { alpha: 1 }, 'half');
		timeline.add(function(){
			this.name.text = name;
		}.bind(this), 'half')
	}
})()




