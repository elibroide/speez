// StagePlayer.js

com.speez.components = _.extend({}, com.speez.components);
com.speez.components.StagePlayer = (function(){

	StagePlayer = function (x, y, options) {
		options = $.extend({
			x: x,
			y: y,
			disappearY: 1000,
			nameFormat: {
		        font: "30px Montserrat",
		        align: "center"
		    },
		    pointsFormat: {
		    	font: "30px Montserrat",
		        align: "center",
		    },
		    color: 0xfefefe,
		    offColor: 0x010101,
		    name: 'Angry Llama',
		    points: '0',

		    colorTime: 0.5,

		    colorFadeInTime: 0.5,
		    colorFadeOutTime: 0.5,
		    colorDelayTime: 2,

		    addPointsDelayTime: 2,
		    addPointsTime: 0.5,

		    appearTime: 0.5,
		    disappearTime: 0.5,

		    lineWidth: 100,
		    lineHeight: 4,
		}, options);
		this.options = options;
		options.nameFormat.fill = '#' + common.toRgbHex(options.color);
		options.pointsFormat.fill = '#' + common.toRgbHex(options.color);

		this.points = options.points;

	    Phaser.Sprite.call(this, game, x, this.options.disappearY);

	    var lineY = 40;
	    var radius = 50;
	    this.background = new Phaser.Graphics(game, 0, lineY);
	    this.background.beginFill(this.options.offColor);
	    this.background.drawRoundedRect(-this.options.lineWidth, -this.options.lineHeight, this.options.lineWidth * 2, this.options.lineHeight * 2, radius);
	    this.addChild(this.background);

	    this.foreground = new Phaser.Graphics(game, 0, lineY);
	    this.foreground.beginFill(this.options.color);
	    this.foreground.drawRoundedRect(-this.options.lineWidth, -this.options.lineHeight, this.options.lineWidth * 2, this.options.lineHeight * 2, radius);
	    this.foreground.colorChange = common.graphicsColorChange(0);
	    this.addChild(this.foreground);

	    this.text = new Phaser.Text(game, 0, 0, options.name, this.options.nameFormat);
	    this.text.colorChange = common.textColorChange();
	    this.text.anchor.set(0.5);
	    this.addChild(this.text);

	    this.textPoints = new Phaser.Text(game, 0, 80, this.options.points, this.options.pointsFormat);
	    this.textPoints.anchor.set(0.5);
	    this.textPoints.colorChange = common.textColorChange();
	    this.addChild(this.textPoints);

	    this.events.onDestroy.add(onDestroy, this);
	    this.currentColor = this.options.color;
	    this.alpha = 0;
	}

	// Constructors
	StagePlayer.prototype = Object.create(Phaser.Sprite.prototype);
	StagePlayer.prototype.constructor = StagePlayer;

	// private methods

	function pointsUpdate(){
		this.textAddPoints.text = "+ " + Math.ceil(this.currentAdd);
		this.textPoints.text = Math.ceil(this.points);
	}

	function pointsComplete(text){
		text.destroy();
		// this.addPointsTimeline.kill();
	}

	function colorComplete(){
		this.currentColor = this.options.color;
		this.colorTween.kill();
	}

	function onDestroy(){
		TweenMax.killTweensOf(this);
		TweenMax.killTweensOf(this.textPoints);
		TweenMax.killTweensOf(this.text);
		if(this.flashTimeline){
			this.flashTimeline.kill();
		}
	}

	// public Methods

	StagePlayer.prototype.appear = function() {
		var timeline = new TimelineMax();
		timeline.to(this, this.options.appearTime, { y: this.options.y, ease: Power4.easeOut });
		return timeline;
	};

	StagePlayer.prototype.disappear = function() {
		var timeline = new TimelineMax();
		timeline.to(this, this.options.disappearTime, { y: this.options.disappearY, ease: Power4.easeIn });
		return timeline;
	};

	StagePlayer.prototype.removePlayer = function() {
	}

	StagePlayer.prototype.setPlayer = function(name, points, isAnimate) {
		if(!isAnimate){
			this.alpha = 1;
			this.text.text = name;
			this.textPoints.text = points;
			return;
		}
	}

	StagePlayer.prototype.setColor = function(color) {
		if(this.colorTween){
			this.colorTween.kill();
		}
		this.currentColor = color;
		this.colorTween = new TimelineMax({ onComplete: colorComplete, onCompleteScope: this });
		this.colorTween.to([ this.textPoints, this.text, this.textAddPoints ], this.options.colorTime, { colorProps: { colorChange: color } })
	    this.colorTween.addLabel('fadeOut', '+=' + this.options.colorDelayTime);
		this.colorTween.to([ this.textPoints, this.text, this.textAddPoints ], this.options.colorTime, { colorProps: { colorChange: this.options.color } }, 'fadeOut')
		return this.colorTween;
	};

	StagePlayer.prototype.addPoints = function(add, total) {
		if(this.addPointsTimeline && this.addPointsTimeline.getLabelBefore() !== 'fadeOut'){
			this.targetAdd += add;
	    	this.addPointsTimeline.to(this, this.options.addPointsTime, { points: total, currentAdd: this.targetAdd, onUpdate: pointsUpdate, onUpdateScope: this }, 'fadeInEnd');
			this.addPointsTimeline.seek('fadeInEnd');
			return;
		}
		
		this.targetAdd = add;
		this.currentAdd = this.targetAdd;
		var textAddPoints = new Phaser.Text(game, 50, 80, '+ ' + add, _.extend(this.options.pointsFormat, { fill: '#' + common.toRgbHex(this.currentColor) }));
	    textAddPoints.anchor.set(0.5);
	    textAddPoints.alpha = 0;
	    this.textAddPoints = textAddPoints;
	    this.addChild(textAddPoints);
	    
	    this.addPointsTimeline = new TimelineMax();
	    this.addPointsTimeline.to(this, this.options.addPointsTime, { points: total, onUpdate: pointsUpdate, onUpdateScope: this });
	    this.addPointsTimeline.to(textAddPoints, this.options.addPointsTime, { alpha: 1,  x: 100 }, 0);
	    this.addPointsTimeline.addLabel('fadeInEnd');
	    this.addPointsTimeline.addLabel('fadeOut', '+=' + this.options.addPointsDelayTime);
	    this.addPointsTimeline.to(textAddPoints, this.options.addPointsTime, { onComplete: pointsComplete, onCompleteParams: [textAddPoints], onCompleteScope: this, alpha: 0 }, 'fadeOut');
	  
	    return this.addPointsTimeline;
	};

	StagePlayer.prototype.setCards = function(progress) {
		this.foreground.graphicsData[0].points[2] = this.options.lineWidth * 2 * progress;
	};

	StagePlayer.prototype.flash = function(speed, color) {
		if(this.flashTimeline){
			this.flashTimeline.kill();
		}
		this.flashTimeline = new TimelineMax({ repeat: -1 });
		this.flashTimeline.to(this.foreground, speed, { colorProps: { colorChange: color } });
		this.flashTimeline.to(this.foreground, speed, { colorProps: { colorChange: this.options.color } });
	};

})()






