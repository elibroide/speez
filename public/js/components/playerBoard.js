// playerBoard.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.PlayerBoard = (function(){

	function PlayerBoard(x, y, width, height, color, options){
		options = _.extend({
			radius: width,
			gap: 30,
			color: color,
			arrowTime: 0.5,
			diffuseAlpha: 0,
			onAlpha: 1,
			halfAlpha: 0.6,
			proximityTime: 0.2,
			appearTime: 1,
		}, options);
		this.options = options;
		
		Phaser.Sprite.call(this, game, x, y);
		game.add.existing(this);

		this.isLeft = x === 0;

		// Background
		this.background = game.add.graphics();
		this.background.x = this.isLeft ? -(options.radius + options.gap)*2 : (options.radius + options.gap)*2;
		this.background.y = height / 2;
		this.background.beginFill(this.options.color);
		this.background.fillAlpha = options.diffuseAlpha;
		this.background.drawCircle(0, 0, options.radius);
		// this.background.drawEllipse(0, 0, width, height*0.43);
		this.background.circle = this.background.graphicsData[0];
		this.addChild(this.background);

		this.backgroundOutline = new Phaser.Graphics(game);
		this.backgroundOutline.lineStyle(5, this.options.color, 1, [10]);
		// this.backgroundOutline.drawEllipse(0, 0, width, height*0.43);
		this.backgroundOutline.drawCircle(0, 0, options.radius);
		this.backgroundOutline.angle = this.isLeft ? 180 : 0;
		this.backgroundOutline.cacheAsBitmap = true;
		this.backgroundOutline = game.add.sprite(this.background.x, height / 2, this.backgroundOutline.generateTexture());
		this.backgroundOutline.anchor.set(0.5);
		this.addChild(this.backgroundOutline);

		this.text = new Phaser.Text(game, width * 0.5, height * 0.5, '', {
			font: "75px FontAwesome",
	        align: "center",
	        fill: '#' + common.toRgbHex(options.color),
		});
	    this.text.anchor.set(0.5, 0.5);
	    this.text.colorChange = common.textColorChange();
		this.text.visible = false;
		this.text.text = this.isLeft ? '\uf060' : '\uf061';
	    this.addChild(this.text);

		this.area = new com.LayoutArea(x, y, width, height, { isDebug: false });
		this.area.attach(this, {
			mode: Layout.PROPORTIONAL_INSIDE,
			width: width,
			height: height,
			alignHorizontal: this.isLeft ? Layout.ALIGN_LEFT : Layout.ALIGN_RIGHT,
		});


		this.effectOptions = {
			count: 3,
			backRadius: options.radius * 1,
			blurRadius: 50,
		};
		this.animationOptions = {
			delays: [ 0, 0, 0 ],
			inTimes: [ 0.4, 0.5, 0.6 ],
			outTimes: [ 0.6, 0.5, 0.4 ],
			scales: [ 1, 0.8, 0.6 ],
		};
	}

	// Constructors
	PlayerBoard.prototype = Object.create(Phaser.Sprite.prototype);
	PlayerBoard.prototype.constructor = PlayerBoard;

	// private methods

	function animateArrow(){
		var start = this.options.radius * 0.5 + (this.isLeft ? -5 : 5)
		this.arrowTimeline = new TimelineMax({ repeat: -1 });
		this.arrowTimeline.fromTo(this.text, this.options.arrowTime, 
			{ x: start },
			{ x: this.options.radius * 0.5 + (this.isLeft ? -20 : 20), ease: Back.easeOut });
		this.arrowTimeline.to(this.text, this.options.arrowTime, { x: start, ease: Back.easeOut });
	}

	// public methods

	PlayerBoard.prototype.destroyTween = function() {
		if(this.timeline){
			this.timeline.kill();
		}
	};

	PlayerBoard.prototype.setArrow = function() {
		this.text.visible = true;
	};

	PlayerBoard.prototype.cancelArrow = function() {
		this.text.visible = false;
	};

	PlayerBoard.prototype.setCard = function() {
		return TweenLite.to(this.background.circle, this.options.proximityTime, { fillAlpha: 1 }, 0)
	};

	PlayerBoard.prototype.cancelCard = function() {
		return TweenLite.to(this.background.circle, this.options.proximityTime, { fillAlpha: this.options.diffuseAlpha }, 0)
	};

	PlayerBoard.prototype.setCardSuccess = function() {
		var incomingEffect = new com.speez.components.IncomingEffect(_.extend({
			color: this.options.color,
			name: 'board' + this.options.color.toString(16),
			blurColor: common.addHsl(this.options.color, 0.1),
		}, this.effectOptions));
		incomingEffect.x = this.background.x;
		incomingEffect.y = this.background.y;
		this.addChildAt(incomingEffect, 0);

		var timeline = incomingEffect.animate(this.animationOptions);
		timeline.timeScale(2.2);
		return timeline;
	};

	PlayerBoard.prototype.setProximity = function(isProximity) {
		if(!isProximity){
			return;
		}
		return TweenLite.to(this.background.circle, this.options.proximityTime, { fillAlpha: this.options.halfAlpha }, 0)
	};

	PlayerBoard.prototype.cancelProximity = function() {
		return TweenLite.to(this.background.circle, this.options.proximityTime, { fillAlpha: this.options.diffuseAlpha }, 0)
	};

	PlayerBoard.prototype.appear = function() {
		var timeline = new TimelineLite();
		timeline.fromTo([this.background, this.backgroundOutline ], this.options.appearTime, 
			{ x: this.isLeft ? -(this.options.radius + this.options.gap)*2 : (this.options.radius + this.options.gap)*2 },
			{ x: this.isLeft ? -(this.options.gap) : (this.options.radius + this.options.gap), ease: Sine.easeOut }
		);
		timeline.add(animateArrow.bind(this));
		return timeline;
	};

	PlayerBoard.prototype.disappear = function() {
		var timeline = new TimelineLite();
		timeline.fromTo([this.background, this.backgroundOutline ], this.options.appearTime, 
			{ x: this.isLeft ? -(this.options.gap) : (this.options.radius + this.options.gap) },
			{ x: this.isLeft ? -(this.options.radius + this.options.gap)*2 : (this.options.radius + this.options.gap)*2, ease: Sine.easeIn }
		);
		return timeline;
	};

	PlayerBoard.prototype.postUpdate = function() {
		this.backgroundOutline.angle += 0.2;
	};

	return PlayerBoard;
})();









