// rain.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.Rain = (function(){

	function Rain(options){
		options = _.extend({
			minX: 0,
			maxX: 100,
			frequencyMin: 0.01,
			frequencyMax: 0.1,
			angleMin: -1,
			angleMax: 1,
			widthMin: 5,
			widthMax: 10,
			heightMin: 50,
			heightMax: 200,
			color: 0xc6c6c6,
			targetY: 1000,
			speedMin: 0.6,
			speedMax: 0.6,
		}, options);
		this.options = options;
	    
	    Phaser.Sprite.call(this, game, 0, 0);
    	
    	this.counted = 0;

    	this.random = new Phaser.RandomDataGenerator();
	}

	// Constructors
	Rain.prototype = Object.create(Phaser.Sprite.prototype);
	Rain.prototype.constructor = Rain;

	// private methods

	function rainComplete(rain){
		rain.destroy();
	}

	function create(options){
		var background = new Phaser.Graphics(game);
		background.beginFill(options.color);
		background.drawRect(0, 0, options.width, options.height);

		var rain = new Phaser.Sprite(game, options.x, options.y, background.generateTexture());
		rain.angle = options.angle;
		rain.anchor.set(0.5);

		var timeline = new TimelineMax({ onComplete: rainComplete, onCompleteScope: this, onCompleteParams: [rain] });
		timeline.to(rain, options.speed, { y: options.targetY, ease: Linear.easeNone });
		rain.timeline = timeline;

		this.addChild(rain);

		return rain;
	}

	// public methods

	Rain.prototype.activate = function() {
	    this.active = true;
	};

	Rain.prototype.postUpdate = function() {
		if(!this.active){
			return;
		}

		this.counted -= game.time.elapsed * 0.001;
		if(this.counted > 0){
			return;
		}
		this.counted = this.random.realInRange(this.options.frequencyMin, this.options.frequencyMax);
		create.call(this, {
			color: this.options.color,
			x: _.random(this.options.minX, this.options.maxX),
			y: this.options.y,
			angle: _.random(this.options.angleMin, this.options.angleMax),
			width: _.random(this.options.widthMin, this.options.widthMax),
			height: _.random(this.options.heightMin, this.options.heightMax),
			targetY: this.options.targetY,
			speed: this.random.realInRange(this.options.speedMin, this.options.speedMax),
		});
	};

	return Rain;
})();






