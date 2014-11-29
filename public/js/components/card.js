// card.js
com.speez.components = _.extend({}, com.speez.components);
com.speez.components.Card = (function(){

	Card = function (index, x, y, width, height, options) {
		
		options = _.extend({
			x: 0,
			y: 0,
			index: index,
			width: width,
			height: height,
			radius: 20,
			gapX: 5,
			gapY: 5,
			color: 0x292929,
		    textColor: 0xFEFEFE,
		    diffusedColor: 0x212121,
			diffusedTextColor: 0x282828,
			pickUpColor: 0xffffff,
		    pickUpTextColor: 0x010101,
			pickUpAlpha: 1,
			card: _.random(0,9),
			overlappedColor: 0xFEFEFE,
			overlappingAlpha: 1,
			overlapOutlineLineColor: 0xFEFEFE,
			waitCard: '+',
			startTime: 2,
			spinTime: 1,
			returnTime: 0.1,
			colorTime: 0.1,
			placeCardTime: 0.5,
			winnerTime: 0.5,
			winnerScale: 5,
			overlapCompleteTime: 0.4,
			format: {
		        font: "100px Montserrat",
		        align: "center"
		    },
		    isNew: false,
		    threshold: 0.1,
		    dragStartCallback: null,
		    dragStopCallback: null,

		    shakeTime: 0.5,
			shake: 75,
			heightOffset: 35,

		}, options);
		// threshold colors
		this.thresholdHit = Card.THRESHOLD_NONE;

		this.options = options;
		this.index = index;
		this.overlap = null;
		this.card = options.card;
		this.faceup = false;

	    Phaser.Sprite.call(this, game, options.x, options.y);
	    game.add.existing(this);
	    this.area = new com.LayoutArea(x, y, width, height, { isDebug: false });

	    // Adding background
	    this.background = new Phaser.Graphics(game);
		this.background.beginFill(options.diffusedColor)
		var rectWidth = options.width - this.options.gapX * 2;
		var rectHeight = options.height - this.options.gapY * 2;
		this.background.x = rectWidth / 2;
		this.background.y = rectHeight / 2;
	    this.background.pivot.set(rectWidth * 0.5, rectHeight * 0.5);
	    this.background.drawRoundedRect(this.options.gapX, this.options.gapY, rectWidth, rectHeight, this.options.radius);
	    this.background.colorChange = common.graphicsColorChange(0);

	    this.backContainer = game.add.sprite();
	    this.backContainer.addChild(this.background);
	    this.addChild(this.backContainer);
	    this.area.attach(this.backContainer, { width: options.width, height: options.height, mode: Layout.PROPORTIONAL_INSIDE });

	    var overlapOutline = new Phaser.Graphics(game);
	    overlapOutline.lineWidth = 5;
	    overlapOutline.lineDash = 20;
	    overlapOutline.lineColor = this.options.overlapOutlineLineColor;
	    overlapOutline.drawRoundedRect(0, 0, options.width - this.options.gapX * 2, options.height - this.options.gapY * 2, this.options.radius);
	    overlapOutline = game.add.sprite(-10, -10, overlapOutline.generateTexture());
	    this.overlapOutline = game.add.sprite(0, 0);
	    this.overlapOutline.addChild(overlapOutline);
	    this.overlapOutline.alpha = 0;
	    this.area.attach(this.overlapOutline, { width: options.width, height: options.height, mode: Layout.PROPORTIONAL_INSIDE });
	    this.addChild(this.overlapOutline);

	    var solid = game.add.graphics(0, 0);
	    solid.drawRect(0, 0, options.width, options.height-20);
	    this.solidSprite = game.add.sprite(0, 0, solid.generateTexture());
	    this.addChild(this.solidSprite);
	    this.area.attach(this.solidSprite, { width: options.width, height: options.height, mode: Layout.STRETCH });

	    // content
	    this.container = game.add.sprite();
	    this.addChild(this.container);
	    this.area.attach(this.container, { width: options.width, height: options.height });

	    // Adding Text
	    this.text = new Phaser.Text(game, options.width * 0.5, options.height * 0.5, options.waitCard, options.format);
	    this.text.fill = '#' + this.options.diffusedTextColor.toString(16);
	    this.text.anchor.set(0.5, 0.5);
	    this.text.colorChange = common.textColorChange();
	    this.container.addChild(this.text);

	    // Emitter 
	    // this.emitter = game.add.emitter(0, 0, 100);
	    // this.emitter.particleClass = ParticleFactory.instance.create({
	    // 	name: 'cardParticle',
	    // 	color: this.options.textColor,
	    // 	size: 10,
	    // });
	    // var speed = 300;
	    // this.emitter.setXSpeed(-speed, speed);
	    // this.emitter.setYSpeed(-speed, speed);
	    // // this.emitter.minParticleSpeed.set(-100, 100);
	    // // this.emitter.setAlpha(0.1, 1, 3000);
	    // this.emitter.gravity = 200;
    	// this.emitter.makeParticles();

	    // Properties
	    this.anchor.set(0.5, 0.5);
	    this.enable(true);

	    this.overlapped = new signals.Signal();
	    this.proximity = new signals.Signal();
	    this.appeared = new signals.Signal();

	    this.background.alpha = 1;
		this.text.alpha = 1;
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


	function getThreshold(){
		var x = this.x;
		var y = this.currentRatioY;
		var threshold = game.width * this.options.threshold;
		if(x > this.options.x + threshold){
			if(y < 0.5) {
				return Card.THRESHOLD_RIGHT_TOP;
			} else {
				return Card.THRESHOLD_RIGHT_BOTTOM;
			}
		} else if(x < this.options.x - threshold){
			if(y < 0.5) {
				return Card.THRESHOLD_LEFT_TOP;
			} else {
				return Card.THRESHOLD_LEFT_BOTTOM;
			}
		}
		return undefined;
	}

	// public methods

	Card.prototype.postUpdate = function() {
		if(this.options.waitCard !== '+' || !this.input.isDragged){
			return;
		}

		this.background.angle = this.x / game.world.width * 100;
		var gameHeight = game.height - this.options.heightOffset * Layout.instance.scaleY;
		var currentY = this.background.world.y + (this.options.height * 0.5 - this.options.heightOffset) * Layout.instance.scaleY;
		this.currentRatioY = currentY / gameHeight;
		var threshold = getThreshold.bind(this)();
		if(this.thresholdHit !== threshold){
			this.thresholdHit = threshold;
			if(threshold === undefined){
				this.proximity.dispatch(this);
			} else {
				this.proximity.dispatch(this, threshold);
				this.overlap = null;
				if(this.overlap !== this.index){
					this.overlapped.dispatch(this);
				}
			}
		}
		if(this.thresholdHit !== undefined){
			return;
		}
		var overlap = Math.floor(this.currentRatioY * 5);
		if(overlap === this.index || overlap < 0 || overlap > 4){
			overlap = null;
		}
		if(this.overlap === overlap){
			return;
		}
		this.overlap = overlap;
		if(overlap === null) {
			this.overlapped.dispatch(this);
		} else {
			this.overlapped.dispatch(this, overlap);
		}
	}

	Card.prototype.makeDraggable = function() {
		if(this.options.waitCard !== '+'){
			return;
		}
		this.input.enableDrag(false, true);
	    this.events.onDragStart.add(this.pickUp.bind(this));
	    if(this.options.dragStartCallback){
	    	this.events.onDragStart.add(this.options.dragStartCallback);
	    }
	    if(this.options.dragStopCallback){
	    	this.events.onDragStop.add(this.options.dragStopCallback);
	    }
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
		// timeline.to(this.text, this.options.startTime, { alpha: this.options.diffusedAlpha, ease: Bounce.easeOut });
		return timeline;
	}

	Card.prototype.appearCard = function(isOverlap) {
		this.events.onInputDown.removeAll();
		var timeline = new TimelineLite();
		timeline.add(function(){
			Audio.instance.play('fx', 'card/draw');
		})
		timeline.to(this.text, this.options.spinTime, { angle: 360, ease: Back.easeInOut });
		timeline.addLabel('spinHalf', this.options.spinTime / 2);
		timeline.to(this.background, this.options.spinTime / 2, { alpha: 1 }, 'spinHalf');
		timeline.to(this.background, this.options.spinTime, { alpha: 1, colorProps: { colorChange: this.options.color } }, 0);
		timeline.to(this.text, this.options.spinTime, { alpha: 1, colorProps: { colorChange: this.options.textColor } }, 0);
		timeline.add(function(){
			this.text.text = this.card;

		}.bind(this), 'spinHalf');
		timeline.add(this.makeDraggable.bind(this));
		timeline.add(function(){
			this.faceup = true;
			this.appeared.dispatch(this);
		}.bind(this));
		return timeline;
	};

	Card.prototype.overlapCard = function(newCard) {
		this.card = newCard;
		this.text.angle = 0;
		var timeline = new TimelineLite();
		timeline.to(this.text, this.options.spinTime, { angle: 360, ease: Back.easeInOut });
		timeline.addLabel('spinHalf', this.options.spinTime / 2);
		timeline.to(this.background, this.options.spinTime / 2, { colorProps: { colorChange: this.options.color } }, 'spinHalf');
		timeline.add(function(){
			this.text.text = this.card;
		}.bind(this), 'spinHalf');
		timeline.to(this.text.scale, this.options.spinTime, { x: 1, y: 1 }, 0);
		return timeline;
	}


	Card.prototype.cancelProximity = function() {
		return TweenLite.to(this.background, this.options.colorTime, { colorProps: { colorChange: this.options.pickUpColor } });
	}

	Card.prototype.setProximity = function(color) {
		return TweenLite.to(this.background, this.options.colorTime, { colorProps: { colorChange: color } });
	};

	Card.prototype.cancelOverlapped = function() {
		var timeline = new TimelineLite();
		timeline.to(this.text.scale, this.options.colorTime, { x: 1, y: 1 });
		timeline.to(this.background, this.options.colorTime, { colorProps: { colorChange: this.options.color } });
		return timeline;
	};

	Card.prototype.setOverlapped = function() {
		var timeline = new TimelineLite();
		// timeline.to(this.text.scale, this.options.colorTime, { x: 2, y: 2 });
		timeline.to(this.background, this.options.colorTime, { colorProps: { colorChange: this.options.overlappedColor } });
		return timeline;
	};

	Card.prototype.cancelOverlapping = function() {
		return TweenLite.to(this, this.options.colorTime, { alpha: this.options.pickUpAlpha });
	}

	Card.prototype.setOverlapping = function() {
		return TweenLite.to(this, this.options.colorTime, { alpha: this.options.overlappingAlpha });
	}

	Card.prototype.cancelOverlapSighted = function() {
		var timeline = new TimelineLite();
		timeline.to(this.overlapOutline, this.options.colorTime, { alpha: 0 });
		return timeline;
	}

	Card.prototype.setOverlapSighted = function() {
		var timeline = new TimelineLite();
		timeline.to(this.overlapOutline, this.options.colorTime, { alpha: 1 });
		return timeline;
	};

	Card.prototype.pickUp = function() {
		this.destroyTweens();
		var timeline = new TimelineLite();
		timeline.to(this.background, this.options.colorTime, { colorProps: { colorChange: this.options.pickUpColor } });
		timeline.to(this, this.options.colorTime, { alpha: this.options.pickUpAlpha }, 0);
		timeline.to(this.text, this.options.colorTime, { colorProps: { colorChange: this.options.pickUpTextColor } });
		return timeline;
	}

	Card.prototype.returnCard = function() {
		this.destroyTweens();
		var timeline = new TimelineLite();
		timeline.to(this.background, this.options.colorTime, { angle: 0, colorProps: { colorChange: this.options.color } });
		timeline.to(this, this.options.returnTime, { x: this.options.x, y: this.options.y, alpha: 1 }, 0);
		timeline.to(this.text, this.options.returnTime, { colorProps: { colorChange: this.options.textColor } }, 0);
		return timeline;
	}

	Card.prototype.placeCardBoard = function() {
		var x;
		if(this.thresholdHit === Card.THRESHOLD_LEFT_BOTTOM || this.thresholdHit === Card.THRESHOLD_LEFT_TOP){
			x = -1000;
		} else {
			x = game.width + 500;
		}
		var timeline = new TimelineLite();
		timeline.to(this, this.options.placeCardTime, { x: x, alpha: 0 });
		// timeline.to(this.background.scale, this.options.placeCardTime, { x: 0, y: 0 }, 0);
		return timeline;
	};

	Card.prototype.placeCardOverlap = function() {
		var index = this.overlap - this.index;
		var y = index * this.options.height * Layout.instance.scaleY;
		var timeline = new TimelineLite();
		timeline.to(this, this.options.placeCardTime, { x: this.options.x, y: y, alpha: 0 });
		return timeline;
	}

	Card.prototype.overlapComplete = function() {
		var timeline = new TimelineLite();
		// timeline.add(function(){
			// this.emitter.x = this.background.world.x + this.background.width * 0.5;
			// this.emitter.y = this.background.world.y + this.background.height * 0.5;;
			// game.world.bringToTop(this.emitter);
			// var minScale = 0.1;
			// var maxScale = 1;
			// this.emitter.setScale(minScale, maxScale, minScale, maxScale, 6000, Phaser.Easing.Quintic.Out);
			// this.emitter.start(true, 1000, null, 10);
		// }.bind(this));
		timeline.to(this.background, this.options.overlapCompleteTime, { colorProps: { colorChange: this.options.textColor } });
		timeline.to(this.background, this.options.overlapCompleteTime, { colorProps: { colorChange: this.options.color } });
		return timeline;
	};

	Card.prototype.reject = function() {
		if(!this.faceup){
			return;
		}
		this.destroyTweens();
		this.alpha = 1;
		this.x = this.options.x;
		this.y = this.options.y;
		this.text.alpha = 1;
		this.text.fill = '#' + this.options.textColor.toString(16);
		this.text.scale.set(1,1);
		this.background.angle = 0;
		this.background.graphicsData[0].fillColor = this.options.color;
		this.overlapOutline.alpha = 0;
	};

	Card.prototype.destroyTweens = function() {
		TweenLite.killTweensOf(this);
		TweenLite.killTweensOf(this.text);
		TweenLite.killTweensOf(this.background);
	};

	Card.prototype.shake = function(isLeft, color) {
		game.world.sendToBack(this);
		var timeline = new TimelineLite();
		var targets = [this.options.x + this.options.shake, this.options.x - this.options.shake];
		timeline.to(this, this.options.shakeTime, { x: targets[isLeft ? 0 : 1], ease: Elastic.easeOut });
		timeline.to(this, this.options.shakeTime, { x: targets[isLeft ? 1 : 0], ease: Elastic.easeOut }, '-=' + this.options.shakeTime * 3 / 4);
		timeline.to(this, this.options.shakeTime, { x: this.options.x, ease: Elastic.easeOut }, '-=' + this.options.shakeTime * 3 / 4);
		var completeTime = timeline.duration();
		timeline.to(this.background, completeTime / 4, { colorProps: { colorChange: color } }, 0);
		timeline.to(this.background, completeTime / 4, { colorProps: { colorChange: this.options.color } }, completeTime / 4);
		timeline.timeScale(1.5);
		return timeline;
	};

	Card.prototype.playWinnerStart = function() {
		var timeline = new TimelineLite();
		timeline.to(this.background, this.options.colorTime, {alpha: 0});
		return timeline;
	}

	Card.prototype.playWinner = function() {
		var timeline = new TimelineLite();
		timeline.to(this.text.scale, this.options.winnerTime / 4, { x: this.options.winnerScale, y: this.options.winnerScale }, 0);
		timeline.to(this.text, this.options.winnerTime / 4, { colorProps: { colorChange: _.random(0x555555, 0xcccccc) } }, 0);
		timeline.addLabel('break', this.options.winnerTime / 4);
		timeline.to(this.text.scale, this.options.winnerTime * 3 / 4, { x: 1, y: 1, ease: Elastic.easeOut }, 'break');
		timeline.to(this.text, this.options.winnerTime * 3 / 4, { colorProps: { colorChange: 0xeeeeee } }, 'break');
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





