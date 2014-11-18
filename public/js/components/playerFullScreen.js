// PlayerFullScreen.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.PlayerFullScreen = (function(){

	function PlayerFullScreen(x, y, width, height, options){
		options = _.extend({
			gapY: 50,
			textGapY: 0,
			textGapX: 100,
			symbolGapY: 250,
			width: width,
			height: height,
		}, options);
		this.options = options;
		
		Phaser.Sprite.call(this, game, x, y);
		game.add.existing(this);

		// Background
		this.background = game.add.graphics();
		this.background.drawRect(0, 0, width, height);
		this.background.rect = this.background.graphicsData[0];
		this.addChild(this.background);

		this.container = game.add.sprite();
		this.addChild(this.container);

		this.textContainer = game.add.sprite();
		this.textContainer.x = 0;
		this.textContainer.y = this.options.gapY;
		this.container.addChild(this.textContainer);

		this.area = new com.LayoutArea(x, y, width, height, { isDebug: false });
		this.area.attach(this.background, {
			mode: Layout.STRETCH,
			width: width,
			height: height,
		});

		this.area.attach(this.container, {
			width: width,
			height: height,
		});

		this.events.onDestroy.add(this.onDestroy.bind(this));
	}

	// Constructors
	PlayerFullScreen.prototype = Object.create(Phaser.Sprite.prototype);
	PlayerFullScreen.prototype.constructor = PlayerFullScreen;

	// private methods

	function writeText(texts, symbol) {
		this.texts = [];
		var height = 0;
		_.each(texts, function(data){
			var text = new Phaser.Text(game, this.options.textGapX, height, data.text, {
				font: "125px arial",
		        align: "right",
		        fill: '#' + common.toRgbHex(data.color),
			});
			text.anchor.set(0, 0);
			height += text.height + this.options.textGapY;
			this.textContainer.addChild(text);
		}.bind(this));
		height += this.options.symbolGapY;
		this.symbol = new Phaser.Text(game, this.options.width / 2, height, symbol.text, {
			font: "350px FontAwesome",
	        align: "center",
	        fill: '#' + common.toRgbHex(symbol.color),
		});
		this.symbol.anchor.set(0.5);
		this.textContainer.addChild(this.symbol);
	}

	function onShowStart(){
		game.world.bringToTop(this);
	}

	// public methods

	PlayerFullScreen.prototype.show = function(texts, symbol, options) {
		options = _.extend({
			color: 0xff0000,
			fadeInTime: 0.2,
			fadeOutTime: 0.2,
			delayTime: 3,
			alpha: 0.8,
		}, options);
		this.background.rect.fillColor = options.color;
		this.background.alpha = 0;
		this.textContainer.alpha = 0;
		writeText.bind(this)(texts, symbol);

		if(this.timelineShow){
			this.timelineShow.kill();
		}
		
		this.timelineShow = new TimelineMax({ onStart: onShowStart.bind(this), onComplete: this.onDestroy.bind(this) });
		this.timelineShow.to(this.background, options.fadeInTime, { alpha: options.alpha });
		this.timelineShow.to(this.textContainer, options.fadeInTime, { alpha: options.alpha }, 0);
		this.timelineShow.addLabel('delay', '+=' + options.delayTime);
		if(options.complete){
			this.timelineShow.add(options.complete, 'delay');
		}
		this.timelineShow.to([this.background, this.textContainer], options.fadeOutTime, { alpha: 0 }, 'delay');
		return this.timelineShow;

		game.world.bringToTop(this);
	};

	PlayerFullScreen.prototype.onDestroy = function() {
		if(this.timelineShow){
			this.timelineShow.kill();
		}
	};

	return PlayerFullScreen;
})();









