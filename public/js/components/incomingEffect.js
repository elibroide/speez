// IncomingEffect.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.IncomingEffect = (function(){

	function IncomingEffect(options){
		options = _.extend({
			size: 150,
			color: 0x007bff,
			inTime: 1,
			outTime: 1,
			count: 4,
			blurRadius: 175,
			backRadius: 350,
			blurColor: 0x4400ff,
			name: 'effect',
		}, options);
		this.options = options;
	    
	    Phaser.Sprite.call(this, game, 0, 0);

		BoardFactory.instance.create({
			color: this.options.color,
			name: this.options.name,
			blurRadius: this.options.blurRadius,
			backRadius: this.options.backRadius,
			blurColor: this.options.blurColor,
		});

    	this.circles = [];
    	this.circlesScales = [];
    	for (var i = 0; i < this.options.count; i++) {
    		// create circle
    		var circle = game.add.sprite(0, 0, BoardFactory.instance.get(this.options.name, BoardFactory.TYPE_BACK));
	    	circle.anchor.set(0.5);
	    	circle.scale.set(0);
    		this.addChild(circle);
	    	
	    	// add circle to data
	    	this.circles[i] = circle;
	    	this.circlesScales[i] = circle.scale;
    	};

    	this.events.onDestroy.add(onDestroy, this);
	}

	// Constructors
	IncomingEffect.prototype = Object.create(Phaser.Sprite.prototype);
	IncomingEffect.prototype.constructor = IncomingEffect;

	// private methods

	function onDestroy(){
		BoardFactory.instance.remove(this.options.name);
	}

	// public methods

	IncomingEffect.prototype.animate = function(options) {
		options = _.extend({
			scales: [ 1, 0.75, 0.55, 0.4 ],
			inTimes: [ 1, 1.4, 1.5, 1.45 ],
			outTimes: [ 1, 0.5, 0.5, 0.5 ],
			delays: [ 0.4, 0.4, 0.4, 0.4 ],
		}, options);

		var timeline = new TimelineMax({  });
		for (var i = 0; i < this.circles.length; i++) {
			var circle = this.circles[i];
	    	timeline.fromTo(circle.scale, options.inTimes[i], 
	    		{ x: 0, y: 0 },
	    		{ delay: options.delays[i], x: options.scales[i], y: options.scales[i], ease: Sine.easeOut }, 0);
	    	timeline.to(circle.scale, options.outTimes[i], { x: 0, y: 0, ease: Sine.easeIn }, options.inTimes[i] + options.delays[i]);
		};
		return timeline;
	};

	return IncomingEffect;
})();






