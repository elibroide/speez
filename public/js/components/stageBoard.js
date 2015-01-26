// stageBoard.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.StageBoard = (function(){

	function StageBoard(x, y, options){
		options = _.extend({
			x: x,
			y: y,
			radius: 300,
			color: 0x00f00f,
			diffuseColor: 0x000000,
			backgroundAlpha: 0.3,
			card: 1,
			cardFormat: {
				font: "120px Montserrat",
		        fill: "#ffffff",
		        align: "center"
			},
			startTime: 1,
			setCardTime: 0.4,
			rotateSpeed: -0.2,
			countingTime: 10,
			expandTime: 1,
			disappearTime: 1,
			isLeft: false,
		}, options);
		this.options = options;
		this.card = options.card;
		
		Phaser.Sprite.call(this, game, x, -500);
		game.add.existing(this);

		this.rotateSpeed = options.rotateSpeed / options.radius;

		// Background
		this.background = game.add.graphics();
		this.background.alpha = this.options.backgroundAlpha;
		this.background.beginFill(this.options.color);
		this.background.drawCircle(0,0, this.options.radius);
		this.background.circle = this.background.graphicsData[0];
		this.background.colorChange = common.graphicsColorChange(0);
		this.addChild(this.background);

		this.foreground = game.add.graphics();
		this.foreground.lineStyle(5, this.options.color, 1, [10]);
		this.foreground.colorLineChange = common.graphicsColorChange(0, 'lineColor');
		this.foreground.drawCircle(0,0, this.options.radius);
		this.addChild(this.foreground);

		this.backgroundMask = game.add.graphics();
		this.backgroundMask.drawCircle(0,0, this.options.radius);
		this.backgroundMask.circle = this.backgroundMask.graphicsData[0];
		this.addChild(this.backgroundMask);

		// incoming effect
		this.effectOptions = {
			count: 3,
			backRadius: options.radius * 1.9,
			blurRadius: 52,
		}
		this.animationOptions = {
			delays: [ 0, 0, 0 ],
			inTimes: [ 0.4, 0.5, 0.6 ],
			outTimes: [ 0.6, 0.5, 0.4 ],
			scales: [ 1, 0.9, 0.8 ],
		}

		// card
		createText.call(this);

	    this.circleScales = [this.text.mask.scale, this.background.scale, this.foreground.scale];
	    this.text.visible = false;

	    this.appeared = new signals.Signal();
	    this.counted = new signals.Signal();
	    this.expanded = new signals.Signal();

	    this.events.onDestroy.add(this.destroyTween, this);
	}

	// Constructors
	StageBoard.prototype = Object.create(Phaser.Sprite.prototype);
	StageBoard.prototype.constructor = StageBoard;

	// private methods

	function createText(){
		this.text = new Phaser.Text(game, 0, 0, this.card.toString(), this.options.cardFormat);
	    this.text.anchor.set(0.5);
	    this.text.mask = this.backgroundMask;
	    this.addChild(this.text);
	}

	function onAppearStart(){
		this.text.visible = true;
	}

	function onAppearComplete(){
		this.destroyTween();
		this.appeared.dispatch();
	}

	function onSetCardPartComplete(oldCard){
		if(oldCard){
			oldCard.destroy();
		}
	}

	function onSetCardComplete(incomingEffect){
		if(incomingEffect){
			incomingEffect.destroy();
		}
	}

	// public methods

	StageBoard.prototype.destroyTween = function() {
		if(this.timeline){
			this.timeline.kill();
		}
	};

	StageBoard.prototype.appear = function() {
		var timeline = new TimelineLite({ onStart: onAppearStart.bind(this), onComplete: onAppearComplete, onCompleteScope: this });
		timeline.to(this, this.options.startTime, { y: this.options.y, ease: Power4.easeOut });

		return timeline;
	};

	StageBoard.prototype.disappear = function() {
		var timeline = new TimelineMax();
		timeline.to(this, this.options.disappearTime, { y: 1000, ease: Power4.easeIn });
		return timeline;
	};

	StageBoard.prototype.setCard = function(card, name, isAnimate) {

		var oldCard = this.text;
		this.card = card;
		createText.call(this);

		if(!isAnimate){
			onSetCardPartComplete.call(this, oldCard);
			return;
		}

		var incomingEffect = new com.speez.components.IncomingEffect(_.extend({
			color: this.options.color,
			name: 'board' + this.options.color.toString(16),
			blurColor: common.addHsl(this.options.color, 0.1),
		}, this.effectOptions));
		this.addChildAt(incomingEffect, 0);

		var currentCard = parseInt(oldCard.text);
		var newCard = parseInt(card)
		var direction = currentCard > newCard ? 1 : -1;
		if((currentCard === 9 && newCard === 0) || (currentCard === 0 && newCard === 9)){
			direction *= -1;
		}
		var targetY = this.options.radius + this.text.height;
		this.text.y = targetY * direction;

		var timeline = new TimelineLite({ onComplete: onSetCardComplete, onCompleteScope: this, onCompleteParams: [incomingEffect] });
		timeline.to(oldCard, this.options.setCardTime, { onComplete: onSetCardPartComplete, onCompleteScope: this, onCompleteParams: [oldCard], y: -targetY * direction, ease: Linear.noEase }, 0);
		timeline.to(this.text, this.options.setCardTime, { y: 0, ease: Linear.noEase }, 0);

		timeline.to(this.background, this.options.setCardTime, { alpha: 1, ease: Sine.easeOut }, 0);
		timeline.add(incomingEffect.animate(this.animationOptions), this.options.setCardTime + '-=' + 0.5);
		timeline.to(this.background, this.options.setCardTime, { alpha: this.options.backgroundAlpha, ease: Sine.easeIn }, this.options.setCardTime);

		timeline.to(this.circleScales, this.options.setCardTime, { x: 1.4, y: 1.4, ease: Sine.easeOut }, 0);
		timeline.to(this.circleScales, this.options.setCardTime, { x: 1, y: 1, ease: Sine.easeIn }, this.options.setCardTime);

		return timeline;
	};

	StageBoard.prototype.postUpdate = function() {
		this.foreground.angle += this.rotateSpeed;
	};

	return StageBoard;
})();









