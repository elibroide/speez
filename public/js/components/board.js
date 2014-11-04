// board.js
com.speez.components = _.extend({}, com.speez.components);
com.speez.components.Board = (function(){

	function Board(x, y, width, height, color, options){
		options = _.extend({
			x: x,
			y: y,
			width: width,
			height: height,
			color: color,
			colorTime: 0.2,
			brightness: 0x22,
			darkness: 0x11,
			cardFormat: {
				font: "300px Arial",
		        fill: "#ffffff",
		        align: "center"
			},
			cardTime: 0.25,
			appearTime: 2,
			nameFormat: {
				font: "80px Arial",
		        fill: "#ffffff",
		        align: "center"
			},
			nameHeight: 200,
			nameTime: 3,
			nameFadeInTime: 0.25,
			nameFadeOutTime: 0.25,
		}, options);
		this.options = options;
		
		Phaser.Sprite.call(this, game, x, y);

		// Background
		this.background = game.add.graphics();
		this.background.beginFill(color);
		this.background.drawRect(0, 0, width, height);
		this.addChild(this.background);
		this.area = new com.LayoutArea(x, y, width, height, {isDebug: false});
		this.area.attach(this.background, {
			mode: Layout.STRETCH,
		});

		// content
		game.add.existing(this);
		this.container = game.add.sprite(0, 0);
		this.area.attach(this.container, {
			width: originalWidthCenter,
			height: originalHeight,
			mode: Layout.PROPORTIONAL_INSIDE,
		});

		// card
		this.card = new Phaser.Text(game, width * 0.5, originalHeight * 0.5, '', options.cardFormat);
	    this.card.anchor.set(0.5);
	    this.container.addChild(this.card);
	}

	// Constructors
	Board.prototype = Object.create(Phaser.Sprite.prototype);
	Board.prototype.constructor = Board;

	// Constants
	Object.defineProperty(Board, "LOCATION_LEFT_TOP", { value: 'leftTop' });
	Object.defineProperty(Board, "LOCATION_LEFT_BOTTOM", { value: 'leftBottom' });
	Object.defineProperty(Board, "LOCATION_RIGHT_TOP", { value: 'rightTop' });
	Object.defineProperty(Board, "LOCATION_RIGHT_BOTTOM", { value: 'rightBottom' });

	// private methods

	function onNameComplete(name){
		this.target.destroy();
	}

	// public methods

	Board.prototype.appear = function(color) {
		this.background.graphicsData[0].fillColor = color;
		var timeline = new TimelineLite();
		timeline.to(this, this.options.appearTime, { colorProps: { backgroundColor: this.options.color }, ease: Bounce.easeOut }, 0);
    	return timeline;
	};

	Board.prototype.cancelProximity = function() {
		return TweenLite.to(this, this.options.colorTime, { colorProps: { backgroundColor: this.options.color } }, 0)
	};

	Board.prototype.setProximity = function(isProximity) {
		var color = common.brightness(this.options.color, isProximity ? this.options.brightness : -this.options.darkness);
		return TweenLite.to(this, this.options.colorTime, { colorProps: { backgroundColor: color } }, 0)
	};

	Board.prototype.tweenColor = function(color, time) {
		return TweenLite.to(this, time, { colorProps: { backgroundColor: color }, ease: Sine.easeInOut }, 0)
	};

	Board.prototype.backgroundColor = function(color) {
		if(color !== undefined){
			this.background.graphicsData[0].fillColor = common.getRgb(color);
		}
		return this.background.graphicsData[0].fillColor;
	};

	Board.prototype.setCard = function(card, name) {
		// card
		var timeline = new TimelineLite();
		timeline.to(this.card.scale, this.options.cardTime / 4, { x: 2.5, y: 2.5 }, 0);
		timeline.addLabel('break', this.options.cardTime / 4);
		timeline.add(function(){
			this.card.text = card;
		}.bind(this));
		timeline.to(this.card.scale, this.options.cardTime * 3 / 4, { x: 1, y: 1, ease: Elastic.easeOut }, 'break');
		this.cardTimeline = timeline;

		// name
		if(this.nameTimeline && this.nameTimeline.isActive()){
			if(!name || name !== this.currentName){
				this.nameTimeline.seek('fadeOut');
			} else {
				this.nameTimeline.seek('fadeIn');
				return;
			}
		}
		if(!name){
			return;
		}
		this.currentName = name;
		var name = new Phaser.Text(game, this.options.width * 0.5, originalHeight * 0.5 + this.options.nameHeight, name, this.options.nameFormat);
	    name.anchor.set(0.5);
	    name.alpha = 0;
	    this.container.addChild(name);

		timeline = new TimelineLite();
		timeline.to(name, this.options.nameFadeInTime, { alpha: 1 });
		timeline.addLabel('fadeIn');
		timeline.addLabel('fadeOut', '+=' + this.options.nameTime);
		timeline.to(name, this.options.nameFadeOutTime, { alpha: 0, onComplete: onNameComplete, onCompleteParams: name }, 'fadeOut');
		this.nameTimeline = timeline;
	};

	return Board;
})();









