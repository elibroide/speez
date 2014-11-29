// incoming.js
com.speez.components = _.extend({}, com.speez.components);
com.speez.components.Incoming = (function(){

	function Incoming(x, y, options){
		options = _.extend({
		}, options);
		options = options;
		
		Phaser.Sprite.call(this, game, x, y);
		game.add.existing(this);

		this.timelines = [];
	}

	// Constructors
	Incoming.prototype = Object.create(Phaser.Sprite.prototype);
	Incoming.prototype.constructor = Incoming;

	// private methods

	function complete(options, wrapper, timeline){
		this.timelines.splice(this.timelines.indexOf(timeline), 1);
		timeline.kill();
		wrapper.destroy();
		if(options.complete){
			options.complete();
		}
	}

	function stopComplete(){
		this.destroy();
	}

	// public methods

	Incoming.prototype.makeTexts = function(texts, format) {
		return _.map(texts, function(item){
			var text = new Phaser.Text(game, 0, 0, item.text, format);
	    	text.anchor.set(0.5);
	    	text.anchor.set(0.5);
	    	text.scale.set(0);
	    	text.sound = item.sound;

	    	if(item.angle){
				text.angle = item.angle;
	    	}
	    	return text;
		}.bind(this))
	}

	Incoming.prototype.stop = function() {
		_.each(this.timelines, function(timeline){
			timeline.kill();
		});
		var timeline = new TimelineLite({ onComplete: stopComplete, onCompleteScope: this });
		timeline.to(this, 1, { alpha: 0 });
		return timeline;
	};

	Incoming.prototype.show = function(items, options) {
		options = _.extend({
			format: {
				font: "200px Montserrat",
		        fill: "#111111",
		        align: "center"
			},
			isTexts: false,

			size: 150,
			delay: 0,
			textAngleTime: 1,
			textAngleDelay: 0.4,
			itemInTime: 1.5,
			itemOutTime: 1,
			inTime: 1,
			outTime: 1.5,
			delayBetween: 1,
			timeScale: 1,
		}, options);
		// Effect Options
		options.effectOptions = _.extend({

		}, options.effectOptions);
		// Effect Animation Options
		options.effectAnimationOptions = _.extend({

		}, options.effectAnimationOptions);

		if(options.isTexts){
			items = this.makeTexts(items, options.format);
		}

		var wrapper = game.add.sprite();
		this.addChild(wrapper);

		var incomingEffect = new com.speez.components.IncomingEffect(options.effectOptions);
		wrapper.addChild(incomingEffect);

    	var timeline = new TimelineMax({ onComplete: complete, onCompleteScope: this });
    	timeline.vars.onCompleteParams = [ options, wrapper, timeline ];

    	for (var i = 0; i < items.length; i++) {
    		var item = items[i];

    		var blank = game.add.graphics();
			blank.beginFill(0xffffff);
	    	// blank.scale.set(0);
			blank.drawCircle(0, 0, options.size);

	    	var center = game.add.sprite();
	    	center.addChild(blank);
	    	center.addChild(item);
	    	center.scale.set(0);
			wrapper.addChild(center);

			var centerTimeline = new TimelineMax();
			// angle
	    	centerTimeline.to(item, options.textAngleTime, { angle: 0, ease: Sine.easeOut }, options.textAngleDelay);
	    	// item
	    	centerTimeline.to(item.scale, options.itemInTime, { x: 1, y: 1, ease: Sine.easeOut }, 0);
	    	centerTimeline.addLabel('itemShrink');
	    	centerTimeline.to(item.scale, options.itemOutTime, { x: 0, y: 0, ease: Sine.easeIn }, 'itemShrink');
	    	// white
	    	centerTimeline.to(center.scale, options.inTime, { x: 1, y: 1, ease: Sine.easeOut }, 0);
	    	centerTimeline.addLabel('shrink', options.inTime);
	    	centerTimeline.to(center.scale, options.outTime, { x: 0, y: 0, ease: Sine.easeIn }, 'shrink');
	    	
	    	timeline.addLabel('time' + i, '+=' + (i === 0 ? 0 : options.delayBetween));
	    	timeline.add(centerTimeline, 'time' + i);
    		timeline.add(incomingEffect.animate(options.effectAnimationOptions), 'time' + i);
    	};
    	timeline.timeScale(options.timeScale);
    	this.timeline = timeline;
    	this.timelines.push(timeline);
    	return timeline;
	};

	return Incoming;
})();



















