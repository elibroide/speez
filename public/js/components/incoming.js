// incoming.js
com.speez.components = _.extend({}, com.speez.components);
com.speez.components.Incoming = (function(){

	function Incoming(x, y, options){
		options = _.extend({
		}, options);
		options = options;
		
		Phaser.Sprite.call(this, game, x, y);
		game.add.existing(this);
	}

	// Constructors
	Incoming.prototype = Object.create(Phaser.Sprite.prototype);
	Incoming.prototype.constructor = Incoming;

	// private methods
	function tweenStart(incoming){
		var target = this.target;
		incoming.addChild(target);
	}

	function tweenComplete(incoming){
		var target = this.target;
		incoming.removeChild(target);
		target.destroy();
	}

	// public methods

	Incoming.prototype.makeTexts = function(texts, format) {
		var items = [];
		$.each(texts, function(index, item){
			var text = new Phaser.Text(game, 0, 0, item, format);
	    	text.anchor.set(0.5);
	    	items.push(text);
		}.bind(this))
		return items;
	}

	Incoming.prototype.show = function(items, options) {
		options = _.extend({
			format: {
				font: "200px Arial",
		        fill: "#eeeeee",
		        align: "center"
			},
			isTexts: false,
			fromScale: 0.5,
			toScale: 1.5,
			time: 2,
			fadeInTime: 0.5,
			fadeOutDelayTime: 1,
			fadeOutTime: 0.5,
			stagger: 1,
			delay: 0,
		}, options);

		if(options.isTexts){
			items = this.makeTexts(items, options.format);
		}

		var scales = [];
		$.each(items, function(index, item){
			scales.push(item.scale);
			item.scale.set(options.fromScale);
			item.alpha = 0;
		}.bind(this));

		var timeline = new TimelineLite({ delay: options.delay });
		timeline.staggerTo(items, options.fadeInTime, { alpha: 1, onStart: tweenStart, onStartParams: [this] }, options.stagger, 0);
		timeline.staggerTo(scales, options.time, { x: options.toScale, y: options.toScale }, options.stagger, 0);
		timeline.staggerTo(items, options.fadeOutTime, { alpha: 0, delay: options.fadeOutDelayTime, onComplete: tweenComplete, onCompleteParams: [this] }, options.stagger, 0);
		if(!options.complete){
			return;
		}
		if(!options.completeTime){
			options.completeTime = 0;
		} 
		timeline.add(options.complete, '-=' + options.completeTime);
	};

	return Incoming;
})();