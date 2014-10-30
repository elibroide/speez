// card.js
com.speez.components = _.extend({}, com.speez.components);
com.speez.components.Card = (function(){

	Card = function (index, x, y, width, height, options) {
		
		options = _.extend({
			x: x,
			y: y,
			index: index,
			width: width,
			height: height,
			color: 0x111111,
			pickUpColor: 0xffffff,
			card: _.random(0,9),
			waitCard: '+',
			startTime: 2,
			spinTime: 1,
			returnTime: 0.1,
			colorTime: 0.1,
			placeCardTime: 0.5,
			format: {
		        font: "200px Arial",
		        fill: "#eeeeee",
		        align: "center"
		    },
		    isNew: false,
		    threshold: 0.1,
		    dragStartCallback: this.pickUp.bind(this),
		    dragStopCallback: this.putDown.bind(this),
		    putDownCallback: this.placeCard.bind(this),

		    shakeTime: 0.5,
			shake: 75,
			heightOffset: 40,

		}, options);
		// threshold colors
		var colors = {};
		colors[Card.THRESHOLD_LEFT_TOP] = 0xff0000;
		colors[Card.THRESHOLD_RIGHT_TOP] = 0x00ff00;
		colors[Card.THRESHOLD_LEFT_BOTTOM] = 0xffff00;
		colors[Card.THRESHOLD_RIGHT_BOTTOM] = 0x0000ff;
		options.colors = _.extend(colors, options.colors);

		this.options = options;
		this.index = index;

	    Phaser.Sprite.call(this, game, options.x, options.y);
	    game.add.existing(this);
	    this.area = new com.LayoutArea(x, y, width, height, { isDebug: false });

	    // Adding background
	    this.background = new ColorBox(0, 0, options.width, options.height, options.color);
	    //this.background.changed.add(colorChange.bind(this));
	    this.addChild(this.background);
	    this.area.attach(this.background, { width: options.width, height: options.height, mode: Layout.STRETCH });

	    var solid = game.add.graphics(0, 0);
	    solid.drawRect(0, 0, options.width, options.height);
	    this.solidSprite = game.add.sprite(0, 0, solid.generateTexture());
	    this.addChild(this.solidSprite);
	    this.area.attach(this.solidSprite, { width: options.width, height: options.height, mode: Layout.STRETCH });

	    // content
	    this.container = game.add.sprite();
	    this.addChild(this.container);
	    this.area.attach(this.container, { width: options.width, height: options.height });

	    // Adding Text
	    this.text = new Phaser.Text(game, options.width * 0.5, options.height * 0.5, options.waitCard, options.format);
	    this.text.scale.set(0.5, 0.5);
	    this.text.anchor.set(0.5, 0.5);
	    this.container.addChild(this.text);

	    // Properties
	    this.anchor.set(0.5, 0.5);
	    this.enable(true);

	    this.entered = new signals.Signal();
	    this.exit = new signals.Signal();

	    this.background.alpha = 0;
		this.text.alpha = 0;
	}

	// Constructors
	Card.prototype = Object.create(Phaser.Sprite.prototype);
	Card.prototype.constructor = Card;

	// Constants
	Object.defineProperty(Card, "THRESHOLD_NONE", { value: 4 });
	Object.defineProperty(Card, "THRESHOLD_LEFT_TOP", { value: 0 });
	Object.defineProperty(Card, "THRESHOLD_LEFT_BOTTOM", { value: 2 });
	Object.defineProperty(Card, "THRESHOLD_RIGHT_TOP", { value: 1 });
	Object.defineProperty(Card, "THRESHOLD_RIGHT_BOTTOM", { value: 3 });

	// private methods

	function colorChange(color){
		var rbg = Phaser.Color.getRGB(color);
		this.text.fill = Phaser.Color.RGBtoString(255 - rbg.r, 255 - rbg.g, 255 - rbg.b, 255, '#');
	}

	function getThreshold(x, y){
		var threshold = game.width * this.options.threshold;
		var middleY = (game.height - this.options.height * this.background.scale.y)* 0.5 + this.options.heightOffset;
		if(x > this.options.x + threshold){
			if(y < middleY) {
				return Card.THRESHOLD_RIGHT_TOP;
			} else {
				return Card.THRESHOLD_RIGHT_BOTTOM;
			}
		} else if(x < this.options.x - threshold){
			if(y < middleY) {
				return Card.THRESHOLD_LEFT_TOP;
			} else {
				return Card.THRESHOLD_LEFT_BOTTOM;
			}
		}
		return Card.THRESHOLD_NONE;
	}

	// public methods

	Card.prototype.update = function() {
		if(this.options.waitCard !== '+' || !this.input.isDragged){
			return;
		}
		var threshold = getThreshold.bind(this)(this.x, this.background.world.y);
		if(this.thresholdHit === threshold){
			return;
		}
		this.thresholdHit = threshold;
		if(threshold === Card.THRESHOLD_NONE){
			this.entered.dispatch(threshold);
			this.cancelProximity();
		} else {
			this.exit.dispatch(threshold);
			this.setProximity(this.options.colors[threshold]);
		}
	}

	Card.prototype.makeDraggable = function() {
		if(this.options.waitCard !== '+'){
			return;
		}
		this.input.enableDrag(false, true);
	    this.events.onDragStart.add(this.options.dragStartCallback);
	    this.events.onDragStop.add(this.options.dragStopCallback);
	};

	Card.prototype.makeShowCardClick = function() {
		if(this.options.waitCard !== '+'){
			return;
		}
		this.events.onInputDown.addOnce(this.appearCard.bind(this));
	};

	Card.prototype.startCard = function() {
		if(!this.options.isNew) {
			this.makeShowCardClick()
		}
		var timeline = new TimelineLite();
		timeline.to(this.text, this.options.startTime, { alpha: 1, ease: Bounce.easeOut });
		return timeline;
	}

	Card.prototype.appearCard = function() {
		var timeline = new TimelineLite();
		timeline.to(this.text, this.options.spinTime, { angle: 360, ease: Back.easeInOut });
		timeline.addLabel('spinHalf', this.options.spinTime / 2);
		timeline.to(this.background, this.options.spinTime / 2, { alpha: 1 }, 'spinHalf');
		timeline.add(function(){
			this.text.text = this.options.card;
		}.bind(this), 'spinHalf');
		timeline.add(this.makeDraggable.bind(this));
		return timeline;
	};

	Card.prototype.cancelProximity = function() {
		this.background.tweenColor(this.options.pickUpColor, this.options.colorTime);
	}

	Card.prototype.setProximity = function(color) {
		this.background.tweenColor(color, this.options.colorTime);
	};

	Card.prototype.pickUp = function() {
		this.background.tweenColor(this.options.pickUpColor, this.options.colorTime);
	}

	Card.prototype.putDown = function() {
		if(this.thresholdHit === Card.THRESHOLD_NONE){
			this.returnCard();
			return;
		}
		this.options.putDownCallback(this, this.thresholdHit);
	}

	Card.prototype.returnCard = function() {
		this.background.tweenColor(this.options.color, this.options.colorTime);
		var timeline = new TimelineLite({ onComplete: function(){ this.enable(true); }.bind(this) });
		timeline.to(this, this.options.returnTime, { x: this.options.x, y: this.options.y });
	}

	Card.prototype.placeCard = function() {
		var x;
		this.enable(false);
		if(this.thresholdHit === Card.THRESHOLD_LEFT_BOTTOM || this.thresholdHit === Card.THRESHOLD_LEFT_TOP){
			x = -1000;
		} else {
			x = game.width + 500;
		}
		var timeline = new TimelineLite();
		timeline.to(this, this.options.placeCardTime, { x: x, alpha: 0 });
		// timeline.to(this.background.scale, this.options.placeCardTime, { x: 0, y: 0 }, 0);
		this.placeCardTimeline = timeline;
	};

	Card.prototype.reject = function() {
		if(this.placeCardTimeline && this.placeCardTimeline.isActive()){
			this.placeCardTimeline.kill();
		}
		this.alpha = 1;
		this.x = this.options.x;
		this.y = this.options.y;
	};

	Card.prototype.shake = function(isLeft, color) {
		this.enable(false);
		var timeline = new TimelineLite({ onComplete: function(){
			this.enable(true);
		}.bind(this) });
		var targets = [this.options.x + this.options.shake, this.options.x - this.options.shake];
		timeline.to(this, this.options.shakeTime, { x: targets[isLeft ? 0 : 1], ease: Elastic.easeOut });
		timeline.to(this, this.options.shakeTime, { x: targets[isLeft ? 1 : 0], ease: Elastic.easeOut }, '-=' + this.options.shakeTime * 3 / 4);
		timeline.to(this, this.options.shakeTime, { x: this.options.x, ease: Elastic.easeOut }, '-=' + this.options.shakeTime * 3 / 4);
		var completeTime = timeline.duration();
		timeline.add(this.background.tweenColor(color, completeTime / 4), 0);
		timeline.add(this.background.tweenColor(this.options.color, completeTime / 4), completeTime / 4);
		timeline.timeScale(1.5);
		return timeline;
	};

	Card.prototype.unattach = function() {
		this.area.unattach(this.container);
	};

	Card.prototype.enable = function(isEnabled) {
		if(this.options.waitCard !== '+'){
			return;
		}
		this.inputEnabled = isEnabled;
	};

	// Methods
	return Card;
})();





