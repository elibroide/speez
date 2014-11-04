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
			delayTime: 0.3,
			complete: this.beginCounting.bind(this),
		}, options.card);
		options.counting = _.extend({
			time: 4,
			complete: this.expand.bind(this),
			scale: 0,
			delayTime: 0,
		}, options.counting);
		options.expand = _.extend({
			time: 1,
			scale: 10,
			isBreak: true,
			breakScale: 2.5,
			breakTime: 1,
			breakTimeOut: 0.1,
			colorTime: 0.5,
			delayTime: 0,
			complete: this.deflate.bind(this),
		}, options.expand),
		options.deflate = _.extend({
			time: 1,
			scale: 1,
			delayTime: 0.3,
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

	function setDeflate(){
		var options = this.options.deflate;
		var timeline = new TimelineLite({ });
		timeline.addLabel('deflate', '+=0.1');
		timeline.to(this.scale, options.time, 
			{ x: options.scale, y: options.scale, ease: Back.easeOut }, 'deflate');
		timeline.add(function(){
			if(options.complete){
				options.complete();
			}
		}, '+=' + options.delayTime);
		timeline.addLabel('deflateEnded');
		// timeline.add(function(){ console.log('deflate ended') }, 'deflateEnded');
		// timeline.add(function(){ console.log('deflate started') }, 'deflate');
		return timeline;
	}

	function setCounting(){
		var options = this.options.counting;
		var timeline = new TimelineLite({ });
		console.log('starting');
		timeline.addLabel('counting');
		timeline.to(this, options.time, { colorProps: { backgroundColor: this.options.color } }, 'counting');
		timeline.to(this.scale, options.time, { x: options.scale, y: options.scale, ease: Power3.easeIn }, 'counting');
		timeline.add(function(){
			if(options.complete){
				options.complete();
			}
		}, '+=' + options.delayTime);
		timeline.addLabel('countingEnded');
		// timeline.add(function(){ console.log('counting started') }, 'counting');
		// timeline.add(function(){ console.log('counting ended') }, 'countingEnded');
		return timeline;
	}

	function setExpand(){
		var options = this.options.expand;
		var timeline = new TimelineLite({ });
		timeline.addLabel('expand');
		timeline.to(this, options.colorTime, { colorProps: { backgroundColor: this.options.color } }, 'expand');
		timeline.to(this.scale, options.breakTime, { x: options.breakScale, y: options.breakScale, ease: Elastic.easeOut }, 'expand');
		timeline.addLabel('expandBreak', '-=' + options.breakTimeOut);
		timeline.add(function(){
			if(options.breakCallback){
				options.breakCallback();
			}
		}, 'expandBreak');
		timeline.to(this.scale, options.time, { x: options.scale, y: options.scale }, 'expandBreak');
		timeline.add(function(){
			if(options.complete){
				options.complete();
			}
		}, '+=' + options.delayTime);
		timeline.addLabel('expandEnded');

		// timeline.add(function(){ console.log('expand started') }, 'expand');
		// timeline.add(function(){ console.log('expand ended') }, 'expandEnded');
		return timeline;
	}

	function setCard(color){
		var options = this.options.card;
		var timeline = new TimelineLite({ });
		timeline.addLabel('card');
		timeline.fromTo(this.scale, options.time, {x: 0.5, y: 0.5}, { x: 1, y: 1, ease: Elastic.easeOut }, 'card');
		timeline.to(this, options.time / 2, { colorProps: { backgroundColor: color } }, 'card');
		timeline.addLabel('cardHalf');
		timeline.add(function(){
			if(options.complete){
				options.complete();
			}
		}, 'cardHalf+=' + options.delayTime);
		timeline.addLabel('cardEnded');

		// timeline.add(function(){ console.log('card started') }, 'card');
		// timeline.add(function(){ console.log('card ended') }, 'cardEnded');
		return timeline;
	}

	// public methods

	TimerBall.prototype.setCard = function(color) {
		var options = this.options.card;
		return this.playTimeline(setCard.call(this, color));
	}

	TimerBall.prototype.backgroundColor = function(color) {
		if(color !== undefined){
			this.background.graphicsData[0].fillColor = common.getRgb(color);
		}
		return this.background.graphicsData[0].fillColor;
	};

	TimerBall.prototype.beginCounting = function() {
		return this.playTimeline(setCounting.call(this));
	}

	TimerBall.prototype.expand = function(callback, breakCallback) {
		this.options.expand.complete = callback;
		this.options.expand.breakCallback = breakCallback;
		return this.playTimeline(setExpand.call(this));
	};

	TimerBall.prototype.deflate = function() {
		return this.playTimeline(setDeflate.call(this));
	}

	TimerBall.prototype.playTimeline = function(timeline) {
		if(this.currentTimeline){
			this.currentTimeline.kill();
		}
		if(!timeline){
			return;
		}
		this.currentTimeline = timeline;
		return timeline;
	}

	return TimerBall;
})();



