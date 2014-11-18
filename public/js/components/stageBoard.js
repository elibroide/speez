// stageBoard.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.StageBoard = (function(){

	function StageBoard(options){
		options = _.extend({
			radius: 300,
			color: 0x00f00f,
			backgroundAlpha: 0.3,
			cardFormat: {
				font: "200px Arial",
		        fill: "#ffffff",
		        align: "center"
			},
			startTime: 1,
			cardStartTime: 0.25,
			cardEndTime: 0.1,
			rotateSpeed: -0.2,
			countingTime: 10,
			expandTime: 1,
		}, options);
		this.options = options;
		
		Phaser.Sprite.call(this, game, 0, 0);
		game.add.existing(this);

		// Background
		this.background = game.add.graphics();
		this.background.beginFill(this.options.color);
		this.background.fillAlpha = 0;
		this.background.lineStyle(10, this.options.color, 1, null);
		this.background.drawCircle(0,0, this.options.radius);
		this.background.circle = this.background.graphicsData[0];
		this.addChild(this.background);

		this.backgroundMask = game.add.graphics();
		this.backgroundMask.drawCircle(0,0, this.options.radius);
		this.backgroundMask.circle = this.backgroundMask.graphicsData[0];
		this.addChild(this.backgroundMask);

		// card
		this.card = new Phaser.Text(game, 0, 0, this.options.card.toString(), options.cardFormat);
	    this.card.anchor.set(0.5);
	    this.card.mask = this.backgroundMask;
	    this.addChild(this.card);

	    this.circleScales = [this.card.mask.scale, this.background.scale];
	    this.circleScales[0].x = 0;
	    this.circleScales[0].y = 0;
	    this.circleScales[1].x = 0;
	    this.circleScales[1].y = 0;
	    this.card.visible = false;

	    this.appeared = new signals.Signal();
	    this.counted = new signals.Signal();
	    this.expanded = new signals.Signal();
	}

	// Constructors
	StageBoard.prototype = Object.create(Phaser.Sprite.prototype);
	StageBoard.prototype.constructor = StageBoard;

	// private methods

	function onCountingComplete(){
		this.destroyTween();
		this.card.visible = false;
		this.counted.dispatch(this);
		this.expand();
	}

	function onExpandStart(){
		this.card.visible = true;
	}

	function onExpandComplete(){
		this.expanded.dispatch(this);
	}

	function onAppearStart(){
		this.card.visible = true;
	}

	function onAppearComplete(){
		this.destroyTween();
		this.appeared.dispatch();
	}

	// public methods

	StageBoard.prototype.destroyTween = function() {
		if(this.timeline){
			this.timeline.kill();
		}
	};

	StageBoard.prototype.appear = function() {
		var timeline = new TimelineLite({ onStart: onAppearStart.bind(this), onComplete: onAppearComplete.bind(this) });
		timeline.to(this.circleScales, this.options.startTime, { x: 1, y: 1 });
		timeline.to(this.background.circle, this.options.startTime, { fillAlpha: this.options.backgroundAlpha, ease: Elastic.easeOut }, 0);
	};

	StageBoard.prototype.expand = function() {
		this.destroyTween();
		var timeline = new TimelineLite();
		timeline.to(this.circleScales, this.options.expandTime, { onStart: onExpandStart.bind(this), onComplete: onExpandComplete.bind(this), x: 1, y: 1, ease: Elastic.easeOut });
		timeline.to(this.background.circle, this.options.expandTime, { fillAlpha: this.options.backgroundAlpha, ease: Elastic.easeOut }, 0);
		this.timeline = timeline;
	};

	StageBoard.prototype.counting = function() {
		this.destroyTween();
		var timeline = new TimelineLite();
	    timeline.to(this.background.circle, this.options.countingTime, { fillAlpha: 0, ease: Power4.easeIn });
	    timeline.to(this.circleScales, this.options.countingTime, { onComplete: onCountingComplete.bind(this), x: 0, y: 0, ease: Power4.easeIn }, 0);
		this.timeline = timeline;
	};

	StageBoard.prototype.setCard = function(card, name) {
		this.destroyTween();

		var timeline = new TimelineLite();
		timeline.to(this.card.scale, this.options.cardStartTime, { x: 2.5, y: 2.5 }, 0);
		timeline.to(this.background.circle, this.options.cardStartTime, { fillAlpha: 1 }, 0);
		timeline.to(this.circleScales, this.options.cardStartTime, { x: 1.5, y: 1.5 }, 0);
		timeline.addLabel('break', this.options.cardStartTime);
		timeline.add(function(){
			this.card.text = card;
		}.bind(this));
		timeline.to(this.card.scale, this.options.cardEndTime, { x: 1, y: 1, ease: Back.easeOut }, 'break');
		timeline.to(this.background.circle, this.options.cardStartTime, { fillAlpha: this.options.backgroundAlpha }, 'break');
		timeline.to(this.circleScales, this.options.cardEndTime, { x: 1, y: 1, ease: Back.easeOut }, 'break');
		this.timeline = timeline;
	};

	StageBoard.prototype.postUpdate = function() {
		this.background.angle += this.options.rotateSpeed;
	};

	return StageBoard;
})();









