// timerBall.js
com.speez.components = _.extend({}, com.speez.components);
com.speez.components.TimerBall = (function(){

	function TimerBall(x, y, radius, options){
		// options
		options = _.extend({
			color: 0x000000,
			format: {
				font: "50px Arial",
		        fill: "#eeeeee",
		        align: "center"
			},
			text: '',
		}, options);

		// animation options
		options.card = _.extend({
			time: 0.25,
			delayTime: 0.5,
		}, options.card);
		options.counting = _.extend({
			time: 5,
			complete: this.expand.bind(this),
			scale: 0.2,
		}, options.counting);
		options.expand = _.extend({
			time: 1,
			scale: 10,
			isBreak: true,
			breakScale: 2.5,
			breakTime: 1,
			breakTimeOut: 0.1,
			colorTime: 0.5,
			complete: this.deflate.bind(this),
		}, options.expand),
		options.deflate = _.extend({
			time: 1,
			scale: 1,
			pauseTime: 1,
			complete: this.beginCounting.bind(this),				
		}, options),
		this.options = options;

		Phaser.Sprite.call(this, game, x, y);
		game.add.existing(this);
		this.background = game.add.graphics();
		this.background.beginFill(options.color);
		this.background.drawCircle(0, 0, radius);
		this.addChild(this.background);

		this.text = new Phaser.Text(game, 0, 0, options.text, options.format);
	    this.text.anchor.set(0.5);
	    this.addChild(this.text);
	}

	// Constructors
	TimerBall.prototype = Object.create(Phaser.Sprite.prototype);
	TimerBall.prototype.constructor = TimerBall;

	// private methods

	// public methods

	TimerBall.prototype.setCard = function(color, isStay) {
		var options = this.options.card;
		var timeline = new TimelineLite();
		timeline.to(this.scale, options.time, { x: 1, y: 1, ease: Elastic.easeOut }, 0);
		timeline.to(this, options.time, { colorProps: { backgroundColor: color } }, 0);
		if(!isStay){
			timeline.addLabel('half', '+=' + options.time);
			timeline.to(this, options.time, { colorProps: { backgroundColor: this.options.color } }, 'half');
			timeline.add(this.beginCounting.bind(this), '+=' + options.delayTime);
		}
		if(this.colorTimeline && this.colorTimeline.isActive()){
			this.colorTimeline.kill();
		}
		this.colorTimeline = timeline;
	}

	TimerBall.prototype.backgroundColor = function(color) {
		if(color !== undefined){
			this.background.graphicsData[0].fillColor = common.getRgb(color);
		}
		return this.background.graphicsData[0].fillColor;
	};

	TimerBall.prototype.beginCounting = function() {
		var options = this.options.counting;
		var timeline = new TimelineLite({ onComplete: options.complete });
		timeline.to(this.scale, options.time, { x: options.scale, y: options.scale });
	}

	TimerBall.prototype.expand = function(callback, breakCallback) {
		var options = this.options.expand;
		var timeline = new TimelineLite({ onComplete: callback });
		timeline.to(this, options.colorTime, { colorProps: { backgroundColor: this.options.color } }, 0);
		if(options.isBreak){
			timeline.to(this.scale, options.breakTime, {x: options.breakScale, y: options.breakScale, ease: Elastic.easeOut }, 0);
			timeline.addLabel('break', '-=' + options.breakTimeOut);
			if(breakCallback){
				timeline.add(breakCallback, 'break');
			}
		} else {
			timeline.addLabel('break', 0);
		}
		timeline.to(this.scale, options.time, { x: options.scale, y: options.scale }, 'break');
	};

	TimerBall.prototype.deflate = function() {
		var options = this.options.deflate;
		var timeline = new TimelineLite();
		timeline.to(this.scale, options.time, { x: options.scale, y: options.scale, ease: Back.easeOut }, 0);
		timeline.add(options.complete, '+=' + options.pauseTime);
	}

	return TimerBall;
})();



