// achievement.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.AchievementBoard = (function(){

	function AchievementBoard(x, y, width, height, options){
		options = _.extend({
			x: x,
			y: y,
			width: width,
			height: height,
			color: 0x444444,
			alpha: 0,
			format: {
		        font: "40px Arial",
		        fill: "#eeeeee",
		        stroke: "#111111",
		        align: "center",
		        strokeThickness: 10,
		    },
		    finalHeight: 320,
		    distanceHeight: 50,
		    textAppearTime: 1,
		    textDelayTime: 1,
		    textDissipateTime: 0.3,
		    dissipateTime: 0.3,
		    levelCount: 3,
		}, options);
		this.options = options;
	    
	    Phaser.Sprite.call(this, game, x, y);

		this.background = new ColorBox(x, y, width, height, this.options.color);
		this.background.alpha = this.options.alpha;
		this.addChild(this.background);

		this.container = game.add.sprite(0, 0);
		this.addChild(this.container);

		this.texts = [];
	}

	// Constructors
	AchievementBoard.prototype = Object.create(Phaser.Sprite.prototype);
	AchievementBoard.prototype.constructor = AchievementBoard;

	// public methods

	AchievementBoard.prototype.show = function() {
		this.alpha = 1;
		this.hidden = false;
	};

	AchievementBoard.prototype.hide = function() {
		this.hidden = true;
		_.each(this.texts, function(text){
			if(text.timeline){
				text.timeline.kill()
			}
		}.bind(this));
		var complete = function(){
			_.invoke(this.texts, 'destroy');
			this.texts = [];
		}.bind(this);
		TweenLite.to(this, this.options.dissipateTime, { alpha: 0, onComplete: complete });
	};

	AchievementBoard.prototype.add = function(text) {
		if(this.hidden){
			return;
		}
		var text = new Phaser.Text(game, 0, 0, text, this.options.format);
		text.alpha = 0;
	    text.anchor.set(0.5);
	    this.container.addChild(text);
		this.texts.push(text);

		if(this.texts.length > this.options.levelCount){
			return;
		}
		this.setTextAnimation(text);
	};

	AchievementBoard.prototype.setTextAnimation = function(text) {
		if(text.timeline){
			text.timeline.kill();
		}
		var targetLevel = this.texts.indexOf(text);
		var timeline = new TimelineLite();
		var targetHeight = this.options.finalHeight - targetLevel * this.options.distanceHeight;
		var targetAlpha = targetHeight / this.options.finalHeight;
		timeline.to(text, this.options.textAppearTime, { alpha: targetAlpha, y: targetHeight }, 0);
		if(targetLevel !== 0){
			return;
		}
		timeline.to(text, this.options.textDissipateTime, { alpha: 0 }, '+=' + this.options.textDelayTime);
		timeline.add(function(){
			text.destroy();
			timeline.kill();	
		});
		timeline.add(this.setAllTextsAnimations.bind(this), '-=' + this.options.textDissipateTime * 0.75);
		text.timeline = timeline;
	};

	AchievementBoard.prototype.setAllTextsAnimations = function() {
		this.texts = _.rest(this.texts);
		_.each(this.texts, function(text){
			this.setTextAnimation(text);
		}.bind(this));
	};

	return AchievementBoard;
})();






