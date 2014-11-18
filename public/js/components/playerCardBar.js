// PlayerCardBar.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.PlayerCardBar = (function(){

	function PlayerCardBar(x, y, width, height, options){
		options = _.extend({
			format: {
				font: "75px FontAwesome",
		        align: "center",
		        fill: '#fefefe',
			},
			color: 0x000000,
			colorForeground: 0xfefefe,
			lastOneTime: 0.2,
			lastFiveTime: 0.5,
			colorLastOne: 0xbb3333,
			colorLastFive: 0x33bb33,
		}, options);
		this.options = options;
		
		Phaser.Sprite.call(this, game, x, y);
		game.add.existing(this);

		// Background
		this.background = game.add.graphics();
		this.background.beginFill(this.options.color);
		this.background.drawRect(0, 0, width, height);
		this.addChild(this.background);

		this.foreground = game.add.graphics();
		this.foreground.beginFill(this.options.colorForeground);
		this.foreground.drawRect(0, 0, width, height);
		this.foreground.rect = this.foreground.graphicsData[0];
	    this.foreground.colorChange = common.graphicsColorChange(0);
		
		this.foregroundSprite = game.add.sprite();
		this.foregroundSprite.addChild(this.foreground);
		this.addChild(this.foregroundSprite);

		this.area = new com.LayoutArea(x, y, width, height, { isDebug: false });
		this.area.attach(this.background, {
			mode: Layout.STRETCH,
			width: width,
			height: height,
		});
		this.area.attach(this.foregroundSprite, {
			mode: Layout.STRETCH,
			width: width,
			height: height,
		});

		this.flashLastTimeline = new TimelineMax({ paused: true, repeat: -1 });
		this.flashLastTimeline.to(this.foreground, this.options.lastOneTime, { colorProps: { colorChange: this.options.colorLastOne } });
		this.flashLastTimeline.to(this.foreground, this.options.lastOneTime, { colorProps: { colorChange: this.options.colorForeground } });

		this.flashLastFiveTimeline = new TimelineMax({ paused: true, repeat: -1 });
		this.flashLastFiveTimeline.to(this.foreground, this.options.lastFiveTime, { colorProps: { colorChange: this.options.colorLastFive } });
		this.flashLastFiveTimeline.to(this.foreground, this.options.lastFiveTime, { colorProps: { colorChange: this.options.colorForeground } });

		this.events.onDestroy.add(this.onDestroy.bind(this));
	}

	// Constructors
	PlayerCardBar.prototype = Object.create(Phaser.Sprite.prototype);
	PlayerCardBar.prototype.constructor = PlayerCardBar;

	// private methods


	// public methods

	PlayerCardBar.prototype.setProgress = function(progress) {
		this.foreground.scale.set(progress, 1);
	};

	PlayerCardBar.prototype.flash = function(last) {
		this.flashLastTimeline.stop();
		this.flashLastFiveTimeline.stop();
		if(last === 1){
			this.flashLastTimeline.play();
		} else if(last === 5){
			this.flashLastFiveTimeline.play();
		}
	};

	PlayerCardBar.prototype.onDestroy = function() {
		this.flashLastTimeline.kill();
		this.flashLastFiveTimeline.kill();
	};

	return PlayerCardBar;
})();









